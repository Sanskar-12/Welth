"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "./ui/switch";
import { ArrowUpDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";
import { useEffect } from "react";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    data: updateDefaultAccountData,
    loading: updateDefaultAccountLoading,
    fn: updateDefaultAccountFn,
    error,
  } = useFetchData(updateDefaultAccount);

  const defaultCheckedHandler = async (e, id) => {
    e.preventDefault();

    if (isDefault) {
      // You have to have one default account
      toast.warning("You need atleast 1 default account");
      return;
    }

    await updateDefaultAccountFn(id);
  };

  useEffect(() => {
    if (updateDefaultAccountData?.success) {
      toast.success("Account Switched To Default Successfully");
    }
  }, [updateDefaultAccountData]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to switch to default account");
    }
  }, [error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={(e) => defaultCheckedHandler(e, id)}
            disabled={updateDefaultAccountLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowUpDown className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
