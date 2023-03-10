import { TransformedContributor } from "../types";

export const getContributors = (
  contributors: any[]
): TransformedContributor[] => {
  return contributors.map((c): TransformedContributor => {
    return {
      type: "Contributor",
      contributor: {
        id: c.contributor.id, // TODO can we simplify this
        label: c.contributor.data?.name, // TODO can we simplify this
        type: "Person",
      },
      role: {
        id: c.role.id,
        label: c.role.data?.title[0].text, // TODO can we simplify this
        type: "EditorialContributorRole",
      },
    };
  });
};
