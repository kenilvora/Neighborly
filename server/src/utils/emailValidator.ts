import { validate } from "deep-email-validator";

export default async function emailValidator(email: string): Promise<boolean> {
  try {
    const { valid } = await validate(email);

    return valid;
  } catch (error) {
    return false;
  }
}
