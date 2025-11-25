import type { DateArg } from "date-fns";
import { format } from "date-fns/format";

export function formatDate(date: DateArg<Date>) {
    return format(date, 'dd MMM yyyy h:mm aa');
}
