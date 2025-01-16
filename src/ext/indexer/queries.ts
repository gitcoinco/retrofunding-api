import { gql } from 'graphql-request';

export const getRoundManager = gql`
  query RoundManager($chainId: Int!, $alloPoolId: String!) {
    rounds(
      filter: {
        chainId: { equalTo: $chainId }
        id: { equalTo: $alloPoolId }
        strategyName: { equalTo: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      roles {
        address
      }
    }
  }
`;

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(
      filter: {
        chainId: { equalTo: $chainId }
        id: { equalTo: $roundId }
        strategyName: { equalTo: "allov2.EasyRetroFundingStrategy" }
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
        project: canonicalProject {
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
    application(chainId: $chainId, roundId: $roundId, id: $applicationId) {
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
      filter: {
        chainId: { equalTo: $chainId }
        id: { equalTo: $roundId }
        strategyName: { equalTo: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      totalDistributed
      applications(
        filter: { distributionTransaction: { notEqualTo: "null" } }
      ) {
        id
        distributionTransaction
      }
    }
  }
`;
