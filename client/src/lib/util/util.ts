import type { DateArg } from "date-fns";
import { format } from "date-fns/format";
import z from "zod";

export function formatDate(date: DateArg<Date>) {
    return format(date, 'dd MMM yyyy h:mm aa');
}

export const requiredString = (fieldName: string) => z.string({
    message: `${fieldName} is required`
}).min(1, {
    message: `${fieldName} cannot be empty`
});