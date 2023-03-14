type BasicContributorInformation = {
  id: string;
  label?: string;
};

export type TransformedContributor = {
  type: "Contributor";
  contributor?: BasicContributorInformation & {
    type: "Person" | "Organisation";
  };
  role?: BasicContributorInformation & {
    type: "EditorialContributorRole";
  };
};
