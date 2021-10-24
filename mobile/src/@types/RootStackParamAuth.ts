import react from 'react';

type PropsNavigationAuth = {
  Login: undefined;

  PasswordRecovery: undefined;

  Name: undefined;
  Email: undefined;
  Password: undefined;
  ConfirmPassword: undefined;
  Photo: undefined;

  FixedExpenses: undefined;
  EachFixedExpense: undefined;
  EachFixedExpenseCategory: { createdCategoryName: string };

  FixedIncomes: undefined;
  EachFixedIncome: undefined;
  EachFixedIncomeCategory: { createdCategoryName: string };

  StatsInitial: undefined;

  NewCategory: undefined;
  NewExpenseCategory: undefined;
  NewIncomeCategory: undefined;
};

export default PropsNavigationAuth;
