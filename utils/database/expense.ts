import { PersonalExpense, ExpenseItem, Category } from "@/types/interface";
import { GroupDetailExpense } from "@/types/group";
import { supabase } from "@/utils/supabase";
/**
 * Adds a new personal expense with multiple items or updates an existing one
 *
 * @param userId - User's UUID
 * @param title - Title of the expense
 * @param items - Array of expense items
 * @param description - Optional description
 * @param date - Optional date (defaults to today)
 * @param expenseId - Optional expense ID (if updating an existing expense)
 * @param groupId - Optional group ID
 * @returns Promise resolving to the expense UUID or null if error
 */
export const addOrUpdatePersonalExpense = async (
  userId: string,
  title: string,
  items: ExpenseItem[],
  description?: string,
  date?: string,
  expenseId?: string,
  groupId?: number
): Promise<string | null> => {
  try {
    // Format date as YYYY-MM-DD if provided, otherwise use today
    const formattedDate = date || new Date().toISOString().split("T")[0];

    // Format items array as required by the function
    // Ensure each item has the expected structure for the JSONB parameter
    const formattedItems = items.map((item) => ({
      item_name: item.name,
      amount: item.amount,
      category: item.category,
    }));

    // Call the Supabase RPC function with the appropriate parameters
    const { data, error } = await supabase.rpc(
      "add_or_update_personal_expense",
      {
        p_user_id: userId,
        p_title: title,
        p_description: description || null,
        p_expense_date: formattedDate,
        p_items: formattedItems,
        p_id: expenseId || null,
        p_group_id: groupId || null,
      }
    );

    if (error) {
      console.error("Error adding/updating expense:", error);
      return null;
    }

    return data as string; // The UUID of the created/updated expense
  } catch (error) {
    console.error("Unexpected error adding/updating expense:", error);
    return null;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data as Category[];
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return [];
  }
};

/**
 * Fetches personal expenses for a user for a specific month and year
 *
 * @param userId - User's UUID
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2025)
 * @returns Promise resolving to an array of personal expenses sorted by date
 */
export const getPersonalExpensesByMonth = async (
  userId: string,
  month: number,
  year: number
): Promise<PersonalExpense[]> => {
  try {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Month must be between 1 and 12.");
    }

    const { data, error } = await supabase.rpc(
      "get_personal_expenses_by_month",
      {
        user_uuid: userId,
        month: month,
        year: year,
      }
    );

    if (error) {
      console.error("Error fetching personal expenses:", error);
      throw error;
    }

    // Transform the data to match your interface
    const expenses: PersonalExpense[] = (data || []).map(
      (expense: {
        id: any;
        title: any;
        description: any;
        date: any;
        total_amount: number;
        category: Category;
        created_at: string;
      }) => ({
        id: expense.id,
        userId: userId, // Add userId from the parameter
        title: expense.title,
        description: expense.description || undefined,
        date: expense.date,
        total_amount: expense.total_amount || 0,
        category: expense.category || undefined,
        created_at: expense.created_at || undefined,
      })
    );

    return expenses;
  } catch (error) {
    console.error("Unexpected error fetching personal expenses:", error);
    throw error;
  }
};

export const getPersonalExpenseById = async (
  expenseId: string
): Promise<PersonalExpense | null> => {
  try {
    const { data, error } = await supabase.rpc("get_personal_expense_by_id", {
      expense_uuid: expenseId,
    });

    if (error) {
      console.error("Error fetching personal expense:", error);
      return null;
    }

    // Transform the data to match your interface
    const expense: PersonalExpense = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || undefined,
      category: data.items[0].category,
      date: data.date,
      items: data.items || [],
    };

    return expense;
  } catch (error) {
    console.error("Unexpected error fetching personal expenses:", error);
    return null;
  }
};

/**
 * Add or update a group expense
 * @param expenseId Optional UUID of existing expense to update
 * @param groupId Group ID
 * @param paidBy User ID of the expense creator
 * @param title Expense title
 * @param totalAmount Total expense amount
 * @param date Expense date (ISO string format YYYY-MM-DD)
 * @param notes Optional notes for the expense
 * @param items Array of expense items with their details
 * @returns Promise resolving to the expense ID (new or updated)
 */
export async function addOrUpdateGroupExpense(
  expenseId: string | null,
  groupId: string,
  paidBy: string,
  title: string,
  totalAmount: number,
  date: string,
  notes: string = "",
  items: ExpenseItem[]
): Promise<string> {
  try {
    // Format items for the database function
    const formattedItems = items.map((item) => {
      const formattedItem: any = {
        id: item.id,
        name: item.name,
        amount: item.amount,
        category_id: item.category?.id,
      };

      // Add splits for group expenses if they exist
      if (item.MemberForExpenses && item.MemberForExpenses.length > 0) {
        formattedItem.splits = item.MemberForExpenses.map((member) => ({
          member_id: member.id,
          amount: member.amount,
          percentage: member.percentage,
        }));
      }

      return formattedItem;
    });

    console.log("Formatted items for group expense:", formattedItems);

    // Call the database function
    const { data, error } = await supabase.rpc("add_or_update_group_expense", {
      p_expense_id: expenseId,
      p_group_id: groupId,
      p_paid_by: paidBy,
      p_title: title,
      p_total_amount: totalAmount,
      p_date: date,
      p_notes: notes,
      p_items: formattedItems,
    });

    if (error) {
      console.error("Error saving group expense:", error);
      throw new Error(error.message);
    }

    return data; // The function returns the expense ID
  } catch (error: any) {
    console.error("Exception saving group expense:", error);
    throw new Error(`Failed to save group expense: ${error.message}`);
  }
}

export async function getGroupExpenseById(
  expenseId: string
): Promise<GroupDetailExpense> {
  const { data, error } = await supabase.rpc("get_group_expense_by_id", {
    expense_id: expenseId,
  });

  if (error) {
    console.error("Error fetching group expense:", error);
    throw error;
  }

  const expense: GroupDetailExpense = {
    id: data.id,
    group: {
      id: data.group.id,
      name: data.group.name,
      iconName: data.group.icon_url,
      iconColor: data.group.icon_color || "#000000",
    },
    title: data.title,
    note: data.note,
    date: new Date(data.date),
    amount: data.total || 0,
    paidBy: data.paid_by,
    participants: [],
    participantsNumber: 0,
    userSplit: data.expense_items.map((item: any) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      category: item.category,
      MemberForExpenses: item.splits.map((split: any) => ({
        id: split.member.id,
        name: split.member.username,
        avatar: split.member.avatar,
        amount: split.amount,
        percentage: split.percentage,
      })),
    })),
  };

  console.log("Fetched group expense:", expense.userSplit[0].MemberForExpenses);

  return expense;
}

export function get_group_expense_by_id_for_user(
  expenseId: string,
  userId: string
): Promise<GroupDetailExpense> {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.rpc(
        "get_group_expense_by_id_for_user",
        {
          expense_id: expenseId,
          current_user_id: userId,
        }
      );

      if (error) {
        console.error("Error fetching group expense:", error);
        reject(error);
        return;
      }

      // Transform the data to match your interface
      const expense: GroupDetailExpense = {
        id: data.id,
        group: {
          id: data.group.id,
          name: data.group.name,
          iconName: data.group.icon_url,
          iconColor: data.group.icon_color || "#000000",
        },
        title: data.title,
        note: data.note,
        date: data.date,
        amount: data.total || 0,
        paidBy: data.paid_by,
        participants: data.participants,
        participantsNumber: data.participants.length,
        userSplit: data.expense_items.map((item: any) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          category: item.category,
          userPayment: item.user_payment,
          percentage: item.percentage,
        })),
      };

      resolve(expense);
    } catch (error) {
      console.error("Unexpected error fetching group expense:", error);
      reject(error);
    }
  });
}
