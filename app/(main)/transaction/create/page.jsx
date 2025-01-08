import { getUserAccounts } from "@/actions/dashboard";
import AddTransactionForm from "@/components/add-transaction-form";
import { defaultCategories } from "@/data/categories";

const CreateTransactionPage = async () => {
  const { data } = await getUserAccounts();

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">Add Transaction</h1>

      <AddTransactionForm accounts={data} categories={defaultCategories} />
    </div>
  );
};

export default CreateTransactionPage;
