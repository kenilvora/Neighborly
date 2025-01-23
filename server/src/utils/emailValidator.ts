import { validate } from "deep-email-validator";

export default async function emailValidator(email: string): Promise<boolean> {
  try {
    const validateResult = await validate({
      email,
      validateSMTP: false,
    });

    if (validateResult.valid) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
