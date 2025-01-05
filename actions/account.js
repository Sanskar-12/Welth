"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export const updateDefaultAccount = async (accountId) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorised");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });

    const serialisedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");

    return {
      success: true,
      data: serialisedAccount,
    };
  } catch (error) {
    console.log(error, "UPDATE-DEFAULT-ACCOUNT-ERROR");
    throw new Error(error.message);
  }
};

export const getAccountWithTransactions = async (accountId) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorised");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      return null;
    }

    const serialisedAccount = serializeTransaction(account);

    return {
      success: true,
      data: {
        account: serialisedAccount,
        transactions: account.transactions.map(serializeTransaction),
      },
    };
  } catch (error) {
    console.log(error, "GET-ACCOUNT-WITH-TRANSACTIONS-ERROR");
    throw new Error(error.message);
  }
};

export const bulkDeleteTransactions = async (transactionIds) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions found for the provided IDs.");
    }

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? Number(transaction.amount)
          : -Number(transaction.amount);

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]", "page");

    return { success: true };
  } catch (error) {
    console.log(error, "DELETE-TRANSACTIONS-AND-UPDATE-ACCOUNT-BALANCE-ERROR");
    throw new Error(error.message);
  }
};
