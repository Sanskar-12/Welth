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
