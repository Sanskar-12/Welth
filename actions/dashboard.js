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

export const createAccount = async (data) => {
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

    // converting balance string into float
    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // find existing accounts to check whether user is creating their first account or having more accounts
    const existingAccounts = await db.account.findMany({
      where: {
        userId,
      },
    });

    // deciding whether the account should be default or not
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // if account has to be default then find the previous default account and update it as false
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId,
        isDefault: shouldBeDefault,
      },
    });

    const serialisedAccount = serializeTransaction(account);

    // revalidate cache
    revalidatePath("/dashboard");

    return {
      success: true,
      data: serialisedAccount,
    };
  } catch (error) {
    console.log(error, "CREATE-ACCOUNT-ERROR");
    throw new Error(error.message);
  }
};
