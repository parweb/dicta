import { z } from 'zod';

/**
 * Zod schema for theme validation
 * Ensures type safety and runtime validation for custom themes
 */

/**
 * Deep partial utility type
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Hex color pattern: #RRGGBB (6 digits)
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (#RRGGBB)');

// RGBA color pattern: rgba(r, g, b, a)
const rgbaColorSchema = z
  .string()
  .regex(
    /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/,
    'Must be a valid rgba color'
  );

// Accept either hex or rgba
const colorSchema = z.union([hexColorSchema, rgbaColorSchema]);

// Pixel value: "12px"
const pixelSchema = z
  .string()
  .regex(/^\d+px$/, 'Must be a pixel value (e.g., "12px")');

// Pixel value that can be negative or zero: "-1px", "0px", "12px"
const signedPixelSchema = z
  .string()
  .regex(/^-?\d+px$/, 'Must be a pixel value (e.g., "12px", "-1px")');

// Percentage value: "50%"
const percentageSchema = z
  .string()
  .regex(/^\d+%$/, 'Must be a percentage value (e.g., "50%")');

// Number as string for line heights: "1.4"
const numberStringSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, 'Must be a number string (e.g., "1.4")');

// Spacing value with range validation (0-60px)
const spacingSchema = z
  .string()
  .regex(/^\d+px$/)
  .refine(
    (val) => {
      const num = parseInt(val);
      return num >= 0 && num <= 60;
    },
    { message: 'Spacing must be between 0px and 60px' }
  );

// Font size with range validation (8-48px)
const fontSizeSchema = z
  .string()
  .regex(/^\d+px$/)
  .refine(
    (val) => {
      const num = parseInt(val);
      return num >= 8 && num <= 48;
    },
    { message: 'Font size must be between 8px and 48px' }
  );

// Border radius (can be px or percentage)
const borderRadiusValueSchema = z.union([
  pixelSchema,
  percentageSchema,
  z.literal('50%')
]);

/**
 * Main theme schema
 */
export const themeSchema = z.object({
  colors: z.object({
    background: z.object({
      primary: colorSchema,
      secondary: colorSchema,
      tertiary: colorSchema,
      overlay: colorSchema
    }),
    text: z.object({
      primary: colorSchema,
      secondary: colorSchema,
      tertiary: colorSchema,
      disabled: colorSchema
    }),
    border: z.object({
      primary: colorSchema,
      secondary: colorSchema,
      accent: colorSchema
    }),
    accent: z.object({
      blue: z.object({
        primary: colorSchema,
        light: colorSchema,
        dark: colorSchema,
        background: colorSchema,
        backgroundHover: colorSchema,
        backgroundActive: colorSchema
      }),
      green: z.object({
        primary: colorSchema,
        button: colorSchema
      }),
      red: z.object({
        primary: colorSchema,
        button: colorSchema
      }),
      yellow: z.object({
        primary: colorSchema,
        light: colorSchema,
        background: colorSchema
      }),
      gray: z.object({
        primary: colorSchema,
        light: colorSchema
      })
    }),
    state: z.object({
      success: colorSchema,
      error: colorSchema,
      loading: colorSchema,
      cancelled: colorSchema,
      idle: colorSchema
    })
  }),
  spacing: z.object({
    xs: spacingSchema,
    sm: spacingSchema,
    md: spacingSchema,
    lg: spacingSchema,
    xl: spacingSchema,
    '2xl': spacingSchema,
    '3xl': spacingSchema,
    '4xl': spacingSchema
  }),
  typography: z.object({
    fontSize: z.object({
      xs: fontSizeSchema,
      sm: fontSizeSchema,
      base: fontSizeSchema,
      lg: fontSizeSchema,
      xl: fontSizeSchema,
      '2xl': fontSizeSchema
    }),
    fontWeight: z.object({
      normal: z.number().min(100).max(900),
      medium: z.number().min(100).max(900),
      semibold: z.number().min(100).max(900),
      bold: z.number().min(100).max(900)
    }),
    lineHeight: z.object({
      tight: numberStringSchema,
      normal: numberStringSchema,
      relaxed: numberStringSchema,
      loose: numberStringSchema
    }),
    letterSpacing: z.object({
      tight: signedPixelSchema,
      normal: signedPixelSchema,
      wide: signedPixelSchema,
      wider: signedPixelSchema
    })
  }),
  borderRadius: z.object({
    xs: borderRadiusValueSchema,
    sm: borderRadiusValueSchema,
    md: borderRadiusValueSchema,
    lg: borderRadiusValueSchema,
    full: z.literal('50%')
  })
});

/**
 * Infer TypeScript type from schema
 */
export type ThemeConfig = z.infer<typeof themeSchema>;

/**
 * Partial theme schema for updates
 */
export type PartialThemeConfig = DeepPartial<ThemeConfig>;

/**
 * Validate a theme configuration
 */
export function validateTheme(
  theme: unknown
): { success: true; theme: ThemeConfig } | { success: false; error: string } {
  try {
    const result = themeSchema.safeParse(theme);
    if (result.success) {
      return { success: true, theme: result.data };
    } else {
      // Format Zod errors into readable message
      const errors = result.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return { success: false, error: errors };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Validate a partial theme update
 */
export function validatePartialTheme(
  theme: unknown
): { success: true; data: PartialThemeConfig } | { success: false; error: string } {
  try {
    // For partial updates, just validate that it's an object
    // Actual validation will happen when merged with full theme
    if (typeof theme !== 'object' || theme === null) {
      return { success: false, error: 'Theme must be an object' };
    }
    return { success: true, data: theme as PartialThemeConfig };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
