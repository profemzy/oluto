import { describe, it, expect } from "vitest";
import {
  validateData,
  validateDataSilent,
  isValidData,
  validateArray,
  transactionSchema,
  contactSchema,
  dashboardSummarySchema,
  loginCredentialsSchema,
  uuidSchema,
  decimalStringSchema,
  dateStringSchema,
} from "../../app/lib/validation";

describe("Validation - Common Schemas", () => {
  describe("uuidSchema", () => {
    it("accepts valid UUIDs", () => {
      expect(uuidSchema.safeParse("f0248a73-9cdb-408e-a22a-855d21d72373").success).toBe(true);
    });

    it("rejects invalid UUIDs", () => {
      expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
      expect(uuidSchema.safeParse("").success).toBe(false);
    });
  });

  describe("decimalStringSchema", () => {
    it("accepts valid decimal strings", () => {
      expect(decimalStringSchema.safeParse("100.00").success).toBe(true);
      expect(decimalStringSchema.safeParse("-50.50").success).toBe(true);
      expect(decimalStringSchema.safeParse("0").success).toBe(true);
    });

    it("rejects invalid decimals", () => {
      expect(decimalStringSchema.safeParse("abc").success).toBe(false);
      expect(decimalStringSchema.safeParse("").success).toBe(false);
    });
  });

  describe("dateStringSchema", () => {
    it("accepts valid date strings", () => {
      expect(dateStringSchema.safeParse("2024-01-15").success).toBe(true);
      expect(dateStringSchema.safeParse("2023-12-31").success).toBe(true);
    });

    it("rejects invalid dates", () => {
      expect(dateStringSchema.safeParse("01-15-2024").success).toBe(false);
      expect(dateStringSchema.safeParse("2024/01/15").success).toBe(false);
      expect(dateStringSchema.safeParse("not-a-date").success).toBe(false);
    });
  });
});

describe("Validation - Auth Schemas", () => {
  describe("loginCredentialsSchema", () => {
    it("accepts valid credentials", () => {
      const result = loginCredentialsSchema.safeParse({
        username: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty username", () => {
      const result = loginCredentialsSchema.safeParse({
        username: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginCredentialsSchema.safeParse({
        username: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Validation - Transaction Schema", () => {
  const validTransaction = {
    id: "f0248a73-9cdb-408e-a22a-855d21d72373",
    vendor_name: "Test Vendor",
    amount: "100.00",
    currency: "CAD",
    description: "Test transaction",
    transaction_date: "2024-01-15",
    category: "Office Supplies",
    classification: null,
    status: "posted",
    gst_amount: "5.00",
    pst_amount: "0.00",
    ai_confidence: 0.95,
    ai_suggested_category: null,
    business_id: "f0248a73-9cdb-408e-a22a-855d21d72374",
    import_source: null,
    import_batch_id: null,
    reconciled: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  it("accepts valid transaction", () => {
    expect(transactionSchema.safeParse(validTransaction).success).toBe(true);
  });

  it("rejects invalid amount", () => {
    const invalid = { ...validTransaction, amount: "not-a-number" };
    expect(transactionSchema.safeParse(invalid).success).toBe(false);
  });

  it("accepts empty vendor_name (schema allows it)", () => {
    // Note: transactionSchema doesn't enforce min length on vendor_name
    // This is a deliberate choice - validation can be added if needed
    const withEmptyName = { ...validTransaction, vendor_name: "" };
    expect(transactionSchema.safeParse(withEmptyName).success).toBe(true);
  });
});

describe("Validation - Contact Schema", () => {
  const validContact = {
    id: "f0248a73-9cdb-408e-a22a-855d21d72373",
    business_id: "f0248a73-9cdb-408e-a22a-855d21d72374",
    name: "John Doe",
    contact_type: "Customer" as const,
    email: "john@example.com",
    phone: "555-1234",
    address: "123 Main St",
    city: "Toronto",
    province: "ON",
    postal_code: "M5V 1A1",
    country: "CA",
    tax_number: "123456789",
    is_customer: true,
    is_vendor: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  it("accepts valid contact", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("accepts null email", () => {
    const contact = { ...validContact, email: null };
    expect(contactSchema.safeParse(contact).success).toBe(true);
  });

  it("rejects invalid email", () => {
    const invalid = { ...validContact, email: "not-an-email" };
    expect(contactSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects invalid contact_type", () => {
    const invalid = { ...validContact, contact_type: "Invalid" };
    expect(contactSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("Validation - Dashboard Summary Schema", () => {
  const validDashboard = {
    total_revenue: "10000.00",
    total_expenses: "5000.00",
    tax_reserved: "500.00",
    safe_to_spend: "4500.00",
    tax_collected: "500.00",
    tax_itc: "0.00",
    payments_received: "8000.00",
    outstanding_receivables: "2000.00",
    outstanding_payables: "1000.00",
    exceptions_count: 5,
    transactions_count: 100,
    status_counts: {
      draft: 5,
      processing: 10,
      inbox_user: 3,
      inbox_firm: 2,
      ready: 20,
      posted: 60,
    },
    recent_transactions: [],
    exceptions: [],
  };

  it("accepts valid dashboard summary", () => {
    expect(dashboardSummarySchema.safeParse(validDashboard).success).toBe(true);
  });

  it("rejects invalid decimal", () => {
    const invalid = { ...validDashboard, total_revenue: "abc" };
    expect(dashboardSummarySchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects missing status_counts field", () => {
    const { status_counts, ...invalid } = validDashboard;
    expect(dashboardSummarySchema.safeParse(invalid).success).toBe(false);
  });
});

describe("Validation - Helper Functions", () => {
  describe("validateData", () => {
    it("returns valid data", () => {
      const data = { username: "test", password: "pass" };
      expect(validateData(loginCredentialsSchema, data)).toEqual(data);
    });

    it("throws on invalid data", () => {
      const data = { username: "", password: "pass" };
      expect(() => validateData(loginCredentialsSchema, data)).toThrow(
        "API response validation failed"
      );
    });
  });

  describe("validateDataSilent", () => {
    it("returns valid data", () => {
      const data = { username: "test", password: "pass" };
      expect(validateDataSilent(loginCredentialsSchema, data)).toEqual(data);
    });

    it("returns null on invalid data", () => {
      const data = { username: "", password: "pass" };
      expect(validateDataSilent(loginCredentialsSchema, data)).toBeNull();
    });
  });

  describe("isValidData", () => {
    it("returns true for valid data", () => {
      const data = { username: "test", password: "pass" };
      expect(isValidData(loginCredentialsSchema, data)).toBe(true);
    });

    it("returns false for invalid data", () => {
      const data = { username: "", password: "pass" };
      expect(isValidData(loginCredentialsSchema, data)).toBe(false);
    });

    it("narrows type correctly", () => {
      const data: unknown = { username: "test", password: "pass" };
      if (isValidData(loginCredentialsSchema, data)) {
        // TypeScript knows data is LoginCredentials here
        expect(data.username).toBe("test");
      }
    });
  });

  describe("validateArray", () => {
    it("validates array of items", () => {
      const items = [
        { username: "user1", password: "pass1" },
        { username: "user2", password: "pass2" },
      ];
      expect(validateArray(loginCredentialsSchema, items)).toEqual(items);
    });

    it("throws with index on invalid item", () => {
      const items = [
        { username: "user1", password: "pass1" },
        { username: "", password: "pass2" },
      ];
      expect(() => validateArray(loginCredentialsSchema, items)).toThrow(
        "Item at index 1"
      );
    });
  });
});
