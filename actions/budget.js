"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getCurrentBudget = async (accountId) => {
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

    // find the first budget of the user
    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // find the current month startDate and endDate
    const currentDate = new Date();

    // Get the start date of the month
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Get the end date of the month
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // search for the expenses in the current month
    const totalExpensesInCurrentMonth = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: totalExpensesInCurrentMonth._sum.amount
        ? totalExpensesInCurrentMonth._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.log(error, "GET-CURRENT-BUDGET-ERROR");
    throw new Error(error.message);
  }
};

export const updateBudget = async (amount) => {
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

    // update the budget's amount if found or else create a budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        ...budget,
        amount: budget.amount.toNumber(),
      },
    };
  } catch (error) {
    console.log(error, "UPDATE-BUDGET-ERROR");
    throw new Error(error.message);
  }
};
