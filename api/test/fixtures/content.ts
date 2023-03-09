import { ContentType } from "../../src/types";

export const content = (
  { id }: { id: string } = { id: "abcdefgh" }
): ContentType => ({
  id,
});
