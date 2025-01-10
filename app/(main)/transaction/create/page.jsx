import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import AddTransactionForm from "@/components/add-transaction-form";
import { defaultCategories } from "@/data/categories";

const CreateTransactionPage = async ({ searchParams }) => {
  const { data } = await getUserAccounts();

  const searchparams = await searchParams;
  const editId = searchparams.edit;

  let initialData = null;

  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Update Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm
        accounts={data}
        categories={defaultCategories}
        initialData={initialData}
        editMode={!!editId}
      />
    </div>
  );
};

export default CreateTransactionPage;
