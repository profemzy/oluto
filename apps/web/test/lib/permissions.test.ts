import { describe, it, expect } from "vitest";
import {
  resolveRole,
  hasRole,
  canWrite,
  canAdmin,
  type UserRole,
} from "../../app/lib/permissions";

describe("permissions", () => {
  describe("resolveRole", () => {
    it("returns 'admin' for admin string", () => {
      expect(resolveRole("admin")).toBe("admin");
    });

    it("returns 'accountant' for accountant string", () => {
      expect(resolveRole("accountant")).toBe("accountant");
    });

    it("returns 'viewer' for viewer string", () => {
      expect(resolveRole("viewer")).toBe("viewer");
    });

    it("defaults to viewer for unknown roles", () => {
      expect(resolveRole("superuser")).toBe("viewer");
      expect(resolveRole("user")).toBe("viewer");
      expect(resolveRole("")).toBe("viewer");
    });

    it("defaults to viewer for null/undefined", () => {
      expect(resolveRole(null)).toBe("viewer");
      expect(resolveRole(undefined)).toBe("viewer");
    });
  });

  describe("hasRole", () => {
    it("admin has all roles", () => {
      expect(hasRole("admin", "viewer")).toBe(true);
      expect(hasRole("admin", "accountant")).toBe(true);
      expect(hasRole("admin", "admin")).toBe(true);
    });

    it("accountant has accountant and viewer but not admin", () => {
      expect(hasRole("accountant", "viewer")).toBe(true);
      expect(hasRole("accountant", "accountant")).toBe(true);
      expect(hasRole("accountant", "admin")).toBe(false);
    });

    it("viewer only has viewer", () => {
      expect(hasRole("viewer", "viewer")).toBe(true);
      expect(hasRole("viewer", "accountant")).toBe(false);
      expect(hasRole("viewer", "admin")).toBe(false);
    });
  });

  describe("canWrite", () => {
    it("admin can write", () => {
      expect(canWrite("admin")).toBe(true);
    });

    it("accountant can write", () => {
      expect(canWrite("accountant")).toBe(true);
    });

    it("viewer cannot write", () => {
      expect(canWrite("viewer")).toBe(false);
    });
  });

  describe("canAdmin", () => {
    it("admin has admin access", () => {
      expect(canAdmin("admin")).toBe(true);
    });

    it("accountant does not have admin access", () => {
      expect(canAdmin("accountant")).toBe(false);
    });

    it("viewer does not have admin access", () => {
      expect(canAdmin("viewer")).toBe(false);
    });
  });
});
