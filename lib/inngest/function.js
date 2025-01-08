import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // will run every 6 hours
  async ({ step }) => {
    // fetch all the users budgets with default accounts
    const budgets = await step.run("fetch-budgets", async () => {
      const allBudgetsOfUsers = await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });

      return allBudgetsOfUsers;
    });

    // fetch all the users expenses, budget amount and totalPercentageUsed of the current month
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];

      if (!defaultAccount) {
        continue;
      }

      await step.run(`check-budget-${budget.id}`, async () => {
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
            userId: budget.userId,
            type: "EXPENSE",
            date: {
              gte: startDate,
              lte: endDate,
            },
            accountId: defaultAccount.id,
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpense =
          totalExpensesInCurrentMonth._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpense / budgetAmount) * 100;

        // Check if we should sent the alert email based on percentageUsed
        if (
          percentageUsed >= 80 && // Default threshold of 80%
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // send the mail to the user about expense alert of current month
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpenses: parseInt(totalExpense).toFixed(1),
              },
            }),
          });

          // Update last alert sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}
