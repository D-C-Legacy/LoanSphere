// Comprehensive form validation utilities for LoanSphere
// Addresses developer feedback about missing form validation

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push("Email is required");
  } else if (!emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const phoneRegex = /^[0-9+\-\s()]{10,}$/;
  
  if (!phone) {
    errors.push("Phone number is required");
  } else if (!phoneRegex.test(phone)) {
    errors.push("Please enter a valid phone number (at least 10 digits)");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateAmount = (amount: string, min?: number, max?: number): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(amount);
  
  if (!amount) {
    errors.push("Amount is required");
  } else if (isNaN(numAmount) || numAmount <= 0) {
    errors.push("Please enter a valid amount greater than 0");
  } else {
    if (min !== undefined && numAmount < min) {
      errors.push(`Amount must be at least ${min}`);
    }
    if (max !== undefined && numAmount > max) {
      errors.push(`Amount cannot exceed ${max}`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateRequiredField = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || value.trim() === "") {
    errors.push(`${fieldName} is required`);
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateNationalId = (nationalId: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!nationalId) {
    errors.push("National ID is required");
  } else if (nationalId.length < 6) {
    errors.push("National ID must be at least 6 characters");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!dateOfBirth) {
    errors.push("Date of birth is required");
  } else {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      errors.push("You must be at least 18 years old");
    } else if (age > 100) {
      errors.push("Please enter a valid date of birth");
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateBankAccount = (accountNumber: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!accountNumber) {
    errors.push("Bank account number is required");
  } else if (accountNumber.length < 8) {
    errors.push("Bank account number must be at least 8 digits");
  } else if (!/^\d+$/.test(accountNumber)) {
    errors.push("Bank account number must contain only numbers");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateLoanApplicationStep = (step: number, formData: any): ValidationResult => {
  const errors: string[] = [];
  
  switch (step) {
    case 1: // Loan Details
      const amountValidation = validateAmount(formData.requestedAmount, formData.product?.minAmount, formData.product?.maxAmount);
      if (!amountValidation.isValid) errors.push(...amountValidation.errors);
      
      if (!formData.requestedTerm) errors.push("Repayment term is required");
      if (!formData.purpose) errors.push("Loan purpose is required");
      break;
      
    case 2: // Personal Information
      const emailValidation = validateEmail(formData.personal?.email || "");
      if (!emailValidation.isValid) errors.push(...emailValidation.errors);
      
      const phoneValidation = validatePhone(formData.personal?.phone || "");
      if (!phoneValidation.isValid) errors.push(...phoneValidation.errors);
      
      const nationalIdValidation = validateNationalId(formData.personal?.nationalId || "");
      if (!nationalIdValidation.isValid) errors.push(...nationalIdValidation.errors);
      
      const dobValidation = validateDateOfBirth(formData.personal?.dateOfBirth || "");
      if (!dobValidation.isValid) errors.push(...dobValidation.errors);
      
      ["firstName", "lastName", "address", "maritalStatus"].forEach(field => {
        const fieldValidation = validateRequiredField(formData.personal?.[field] || "", field);
        if (!fieldValidation.isValid) errors.push(...fieldValidation.errors);
      });
      break;
      
    case 3: // Employment
      if (!formData.employment?.status) errors.push("Employment status is required");
      
      const incomeValidation = validateAmount(formData.employment?.monthlyIncome || "", 1);
      if (!incomeValidation.isValid) errors.push(...incomeValidation.errors);
      
      if (formData.employment?.status !== 'unemployed') {
        ["employer", "position"].forEach(field => {
          const fieldValidation = validateRequiredField(formData.employment?.[field] || "", field);
          if (!fieldValidation.isValid) errors.push(...fieldValidation.errors);
        });
      }
      break;
      
    case 4: // Financial Information
      const bankAccountValidation = validateBankAccount(formData.financial?.accountNumber || "");
      if (!bankAccountValidation.isValid) errors.push(...bankAccountValidation.errors);
      
      const expensesValidation = validateAmount(formData.financial?.monthlyExpenses || "", 0);
      if (!expensesValidation.isValid) errors.push(...expensesValidation.errors);
      
      if (!formData.financial?.bankName) errors.push("Bank name is required");
      break;
      
    case 5: // Documents
      if (!formData.documents || formData.documents.length === 0) {
        errors.push("At least one supporting document is required");
      }
      break;
      
    case 6: // Review & Terms
      if (!formData.agreeToTerms) {
        errors.push("You must agree to the terms and conditions");
      }
      break;
  }
  
  return { isValid: errors.length === 0, errors };
};

export const getValidationMessage = (errors: string[]): string => {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];
  return `Please fix the following issues:\n• ${errors.join('\n• ')}`;
};