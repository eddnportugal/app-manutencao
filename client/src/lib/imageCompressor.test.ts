import { describe, it, expect } from "vitest";
import { formatFileSize, COMPRESSION_PRESETS, getFileExtension } from "./imageCompressor";

describe("imageCompressor", () => {
  describe("formatFileSize", () => {
    it("should format 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("should format bytes", () => {
      expect(formatFileSize(500)).toBe("500 Bytes");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(2621440)).toBe("2.5 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });
  });

  describe("getFileExtension", () => {
    it("should return .webp for webp format", () => {
      expect(getFileExtension("webp")).toBe(".webp");
    });

    it("should return .jpg for jpeg format", () => {
      expect(getFileExtension("jpeg")).toBe(".jpg");
    });

    it("should return .png for png format", () => {
      expect(getFileExtension("png")).toBe(".png");
    });

    it("should return .jpg for unknown format", () => {
      expect(getFileExtension("unknown")).toBe(".jpg");
    });
  });

  describe("COMPRESSION_PRESETS", () => {
    it("should have thumbnail preset with WebP", () => {
      expect(COMPRESSION_PRESETS.thumbnail).toBeDefined();
      expect(COMPRESSION_PRESETS.thumbnail.maxWidth).toBe(300);
      expect(COMPRESSION_PRESETS.thumbnail.maxHeight).toBe(300);
      expect(COMPRESSION_PRESETS.thumbnail.quality).toBe(0.75);
      expect(COMPRESSION_PRESETS.thumbnail.outputFormat).toBe("webp");
    });

    it("should have gallery preset with WebP", () => {
      expect(COMPRESSION_PRESETS.gallery).toBeDefined();
      expect(COMPRESSION_PRESETS.gallery.maxWidth).toBe(1200);
      expect(COMPRESSION_PRESETS.gallery.maxHeight).toBe(800);
      expect(COMPRESSION_PRESETS.gallery.quality).toBe(0.82);
      expect(COMPRESSION_PRESETS.gallery.outputFormat).toBe("webp");
    });

    it("should have highQuality preset with WebP", () => {
      expect(COMPRESSION_PRESETS.highQuality).toBeDefined();
      expect(COMPRESSION_PRESETS.highQuality.maxWidth).toBe(1920);
      expect(COMPRESSION_PRESETS.highQuality.maxHeight).toBe(1080);
      expect(COMPRESSION_PRESETS.highQuality.quality).toBe(0.88);
      expect(COMPRESSION_PRESETS.highQuality.outputFormat).toBe("webp");
    });

    it("should have logo preset with PNG format for transparency", () => {
      expect(COMPRESSION_PRESETS.logo).toBeDefined();
      expect(COMPRESSION_PRESETS.logo.outputFormat).toBe("png");
    });

    it("should have cover preset with WebP", () => {
      expect(COMPRESSION_PRESETS.cover).toBeDefined();
      expect(COMPRESSION_PRESETS.cover.maxWidth).toBe(1200);
      expect(COMPRESSION_PRESETS.cover.maxHeight).toBe(1600);
      expect(COMPRESSION_PRESETS.cover.outputFormat).toBe("webp");
    });

    it("should have jpegCompatible preset for maximum compatibility", () => {
      expect(COMPRESSION_PRESETS.jpegCompatible).toBeDefined();
      expect(COMPRESSION_PRESETS.jpegCompatible.outputFormat).toBe("jpeg");
    });

    it("all presets should have required properties", () => {
      Object.values(COMPRESSION_PRESETS).forEach((preset) => {
        expect(preset.maxWidth).toBeGreaterThan(0);
        expect(preset.maxHeight).toBeGreaterThan(0);
        expect(preset.quality).toBeGreaterThan(0);
        expect(preset.quality).toBeLessThanOrEqual(1);
        expect(["jpeg", "webp", "png"]).toContain(preset.outputFormat);
      });
    });

    it("most presets should use WebP for optimal compression", () => {
      const webpPresets = ["thumbnail", "gallery", "highQuality", "cover"];
      webpPresets.forEach((presetName) => {
        const preset = COMPRESSION_PRESETS[presetName as keyof typeof COMPRESSION_PRESETS];
        expect(preset.outputFormat).toBe("webp");
      });
    });
  });
});
