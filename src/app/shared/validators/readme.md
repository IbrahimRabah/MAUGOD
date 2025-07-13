# Custom Validators

A central location used to define custom validation functions, validators, or validation-related utilities that are used across multiple forms or components within the application.

It serves as a reusable library of validation logic, promoting code reusability and maintainability.

## CustomValidators Class

The `CustomValidators` class provides various validators for handling Arabic and English text validation.

### Available Validators

#### Language-specific Validators

1. **`arabicTextValidator`**
   - Ensures the field contains at least one Arabic character
   - Returns error: `noArabicText`

2. **`englishTextValidator`**
   - Ensures the field contains at least one English character
   - Returns error: `noEnglishText`

3. **`noEnglishInArabicValidator`**
   - Prevents English characters in Arabic fields
   - Returns error: `englishInArabic`

4. **`noArabicInEnglishValidator`**
   - Prevents Arabic characters in English fields
   - Returns error: `arabicInEnglish`

5. **`arabicOnlyValidator`**
   - Allows only Arabic characters, numbers, spaces, and common punctuation
   - Returns error: `arabicOnly`

6. **`englishOnlyValidator`**
   - Allows only English characters, numbers, spaces, and common punctuation
   - Returns error: `englishOnly`

### Usage Examples

#### Basic Usage

```typescript
import { CustomValidators } from '../../shared/validators/custom-validators';

// In your component
initializeForm() {
  this.myForm = this.fb.group({
    arTitle: ['', [Validators.required, CustomValidators.noEnglishInArabicValidator]],
    enTitle: ['', [Validators.required, CustomValidators.noArabicInEnglishValidator]],
    arDescription: ['', [CustomValidators.arabicOnlyValidator]],
    enDescription: ['', [CustomValidators.englishOnlyValidator]]
  });
}
```

#### Error Message Handling

```typescript
getFieldError(fieldName: string): string {
  const field = this.myForm.get(fieldName);
  if (field && field.errors && (field.dirty || field.touched)) {
    const isArabic = this.langService.getCurrentLang() === 'ar';
    return CustomValidators.getErrorMessage(field.errors, fieldName, isArabic);
  }
  return '';
}
```

### Error Messages

All validators come with built-in error messages in both Arabic and English:

- **English in Arabic field**: "English text is not allowed in Arabic field" / "لا يمكن كتابة نص إنجليزي في الحقل العربي"
- **Arabic in English field**: "Arabic text is not allowed in English field" / "لا يمكن كتابة نص عربي في الحقل الإنجليزي"
- **Required field**: "This field is required" / "هذا الحقل مطلوب"
- **Arabic only**: "Only Arabic characters, numbers and spaces are allowed" / "يُسمح بالأحرف العربية والأرقام والمسافات فقط"
- **English only**: "Only English characters, numbers and spaces are allowed" / "يُسمح بالأحرف الإنجليزية والأرقام والمسافات فقط"

### Best Practices

1. Always combine with `Validators.required` when the field is mandatory
2. Use the `getErrorMessage` method for consistent error handling
3. Pass the current language to get localized error messages
4. Consider using `arabicOnlyValidator` or `englishOnlyValidator` for stricter validation when needed
