import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Validator to ensure the field contains Arabic text
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static arabicTextValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabic = arabicRegex.test(control.value);
    
    return hasArabic ? null : { noArabicText: true };
  }

  /**
   * Validator to ensure the field contains English text
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static englishTextValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const englishRegex = /[a-zA-Z]/;
    const hasEnglish = englishRegex.test(control.value);
    
    return hasEnglish ? null : { noEnglishText: true };
  }

  /**
   * Validator to prevent English text in Arabic fields
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static noEnglishInArabicValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const englishRegex = /[a-zA-Z]/;
    const hasEnglish = englishRegex.test(control.value);
    
    return hasEnglish ? { englishInArabic: true } : null;
  }

  /**
   * Validator to prevent Arabic text in English fields
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static noArabicInEnglishValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const hasArabic = arabicRegex.test(control.value);
    
    return hasArabic ? { arabicInEnglish: true } : null;
  }

  /**
   * Validator to ensure only Arabic characters and spaces/numbers are allowed
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static arabicOnlyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Allow Arabic characters, numbers, spaces, and common punctuation
    const arabicOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s\.\,\!\?\-\(\)]*$/;
    const isValid = arabicOnlyRegex.test(control.value);
    
    return isValid ? null : { arabicOnly: true };
  }

  /**
   * Validator to ensure only English characters and spaces/numbers are allowed
   * @param control - The form control to validate
   * @returns ValidationErrors | null
   */
  static englishOnlyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Allow English characters, numbers, spaces, and common punctuation
    const englishOnlyRegex = /^[a-zA-Z0-9\s\.\,\!\?\-\(\)]*$/;
    const isValid = englishOnlyRegex.test(control.value);
    
    return isValid ? null : { englishOnly: true };
  }

  /**
   * Get error message for validation errors
   * @param errors - The validation errors object
   * @param fieldName - The name of the field (for context)
   * @param isArabic - Whether to return Arabic or English message
   * @returns string - The error message
   */
  static getErrorMessage(errors: ValidationErrors, fieldName: string = '', isArabic: boolean = false): string {
    if (errors['required']) {
      return isArabic ? 'هذا الحقل مطلوب' : 'This field is required';
    }
    if (errors['englishInArabic']) {
      return isArabic ? 
        'لا يمكن كتابة نص إنجليزي في الحقل العربي' : 
        'English text is not allowed in Arabic field';
    }
    if (errors['arabicInEnglish']) {
      return isArabic ? 
        'لا يمكن كتابة نص عربي في الحقل الإنجليزي' : 
        'Arabic text is not allowed in English field';
    }
    if (errors['noArabicText']) {
      return isArabic ? 
        'يجب أن يحتوي الحقل على نص عربي' : 
        'Field must contain Arabic text';
    }
    if (errors['noEnglishText']) {
      return isArabic ? 
        'يجب أن يحتوي الحقل على نص إنجليزي' : 
        'Field must contain English text';
    }
    if (errors['arabicOnly']) {
      return isArabic ? 
        'يُسمح بالأحرف العربية والأرقام والمسافات فقط' : 
        'Only Arabic characters, numbers and spaces are allowed';
    }
    if (errors['englishOnly']) {
      return isArabic ? 
        'يُسمح بالأحرف الإنجليزية والأرقام والمسافات فقط' : 
        'Only English characters, numbers and spaces are allowed';
    }
    
    return '';
  }
}
