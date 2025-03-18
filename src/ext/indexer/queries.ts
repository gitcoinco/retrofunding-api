import { gql } from 'graphql-request';

export const getRoundManager = gql`
  query RoundManager($chainId: Int!, $alloPoolId: String!) {
    rounds(
      where: {
        chainId: { _eq: $chainId }
        id: { _eq: $alloPoolId }
        strategyName: { _eq: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      roundRoles {
        address
      }
    }
  }
`;

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(
      where: {
        chainId: { _eq: $chainId }
        id: { _eq: $roundId }
        strategyName: { _eq: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      applications {
        id
        metadata
        metadataCid
        status
        projectId
        projects(where: { projectType: { _eq: "canonical" } }) {
          metadata
          metadataCid
        }
      }
    }
  }
`;

export const getApplicationWithRound = gql`
  query RoundApplication(
    $chainId: Int!
    $roundId: String!
    $applicationId: String!
  ) {
    applications(
      where: {
        chainId: { _eq: $chainId }
        roundId: { _eq: $roundId }
        id: { _eq: $applicationId }
      }
    ) {
      metadata
      metadataCid
      round {
        roundMetadata
      }
    }
  }
`;

export const getRoundDistributions = gql`
  query RoundDistributions($chainId: Int!, $roundId: String!) {
    rounds(
      where: {
        chainId: { _eq: $chainId }
        id: { _eq: $roundId }
        strategyName: { _eq: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      totalDistributed
      applications(where: { distributionTransaction: { _isNull: false } }) {
        id
        distributionTransaction
      }
    }
  }
`;
