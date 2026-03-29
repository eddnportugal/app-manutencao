import { describe, expect, it } from "vitest";
import {
  templates,
  templateModerno,
  templateCorporativo,
  templateColorido,
  getTemplateById,
  generateTemplateCSS,
} from "./templates";

describe("templates", () => {
  it("should have exactly 3 templates", () => {
    expect(templates).toHaveLength(3);
  });

  it("should include moderno, corporativo, and colorido templates", () => {
    const ids = templates.map((t) => t.id);
    expect(ids).toContain("moderno");
    expect(ids).toContain("corporativo");
    expect(ids).toContain("colorido");
  });
});

describe("templateModerno", () => {
  it("should have correct id and name", () => {
    expect(templateModerno.id).toBe("moderno");
    expect(templateModerno.name).toBe("Moderno");
  });

  it("should have all required color properties", () => {
    expect(templateModerno.colors.primary).toBeDefined();
    expect(templateModerno.colors.secondary).toBeDefined();
    expect(templateModerno.colors.accent).toBeDefined();
    expect(templateModerno.colors.background).toBeDefined();
    expect(templateModerno.colors.foreground).toBeDefined();
  });

  it("should have typography settings", () => {
    expect(templateModerno.typography.fontFamily).toContain("Inter");
    expect(templateModerno.typography.headingFont).toContain("Playfair");
  });
});

describe("templateCorporativo", () => {
  it("should have correct id and name", () => {
    expect(templateCorporativo.id).toBe("corporativo");
    expect(templateCorporativo.name).toBe("Corporativo");
  });

  it("should have professional blue color scheme", () => {
    expect(templateCorporativo.colors.primary).toBe("#1E3A5F");
    expect(templateCorporativo.colors.accent).toBe("#2563EB");
  });

  it("should have formal typography", () => {
    expect(templateCorporativo.typography.fontFamily).toContain("Source Sans Pro");
    expect(templateCorporativo.typography.headingFont).toContain("Merriweather");
  });
});

describe("templateColorido", () => {
  it("should have correct id and name", () => {
    expect(templateColorido.id).toBe("colorido");
    expect(templateColorido.name).toBe("Colorido");
  });

  it("should have vibrant color scheme", () => {
    expect(templateColorido.colors.primary).toBe("#7C3AED");
    expect(templateColorido.colors.accent).toBe("#F59E0B");
  });

  it("should have playful typography", () => {
    expect(templateColorido.typography.fontFamily).toContain("Nunito");
    expect(templateColorido.typography.headingFont).toContain("Poppins");
  });

  it("should have gradient button style", () => {
    expect(templateColorido.components.buttonStyle).toBe("gradient");
  });
});

describe("getTemplateById", () => {
  it("should return correct template for valid id", () => {
    expect(getTemplateById("moderno")).toBe(templateModerno);
    expect(getTemplateById("corporativo")).toBe(templateCorporativo);
    expect(getTemplateById("colorido")).toBe(templateColorido);
  });

  it("should return moderno template as default for invalid id", () => {
    expect(getTemplateById("invalid")).toBe(templateModerno);
    expect(getTemplateById("")).toBe(templateModerno);
  });
});

describe("generateTemplateCSS", () => {
  it("should generate CSS variables string", () => {
    const css = generateTemplateCSS(templateModerno);
    
    expect(css).toContain("--template-primary:");
    expect(css).toContain("--template-secondary:");
    expect(css).toContain("--template-accent:");
    expect(css).toContain("--template-font-family:");
    expect(css).toContain("--template-heading-font:");
    expect(css).toContain("--template-border-radius:");
  });

  it("should include correct values from template", () => {
    const css = generateTemplateCSS(templateModerno);
    
    expect(css).toContain(templateModerno.colors.primary);
    expect(css).toContain(templateModerno.typography.fontFamily);
    expect(css).toContain(templateModerno.components.borderRadius);
  });
});
