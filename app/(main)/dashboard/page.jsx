import { getCurrentBudget } from "@/actions/budget";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import AccountCard from "@/components/account-card";
import BudgetProgress from "@/components/budget-progress";
import CreateAccountDrawer from "@/components/create-account-drawer";
import DashboardOverview from "@/components/dashboard-overview";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";

const DashboardPage = async () => {
  const { data } = await getUserAccounts();
  const { data: dashboardTransactionData } = await getDashboardData();

  const defaultAccount = data.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Overview */}
      <Suspense fallback={"Loading Overview..."}>
        <DashboardOverview
          accounts={data}
          transactions={dashboardTransactionData || []}
        />
      </Suspense>

      {/* Account Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {data.length > 0 &&
          data.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
};

export default DashboardPage;
