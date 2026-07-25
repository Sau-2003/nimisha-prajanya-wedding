import 'react';

declare module 'react' {
  // This tells TypeScript that 'asChild' is a valid property globally
  interface Attributes {
    asChild?: boolean;
  }
}