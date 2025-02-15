export type Address = `0x${string}`;

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ApplicationMetadata {
  signature: string;
  application: {
    round: string;
    answers: Array<{
      type: string;
      hidden: boolean;
      question: string;
      questionId: number;
      encryptedAnswer?: {
        ciphertext: string;
        encryptedSymmetricKey: string;
      };
    }>;
    project: ProjectMetadata;
    recipient: string;
  };
}

export interface Eligibility {
  description: string;
  requirements?: Array<{
    requirement?: string;
  }>;
}

export interface RoundMetadata {
  name: string;
  roundType: 'public' | 'private';
  eligibility: Eligibility;
  programContractAddress: string;
  support?: {
    info: string;
    type: string;
  };
}

export interface ProjectMetadata {
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  // credentials: ProjectCredentials;
  owners: Array<{ address: string }>;
  createdAt: number;
  lastUpdated: number;
}

export interface Application {
  id: string;
  metadata: ApplicationMetadata;
  metadataCid: string;
  status: Status;
  projectId: string;
  project: {
    metadata: ProjectMetadata;
    metadataCid: string;
  };
}

export interface RoundWithApplications {
  chainId: number;
  id: string;
  roundMetadata: RoundMetadata;
  roundMetadataCid: string;
  applications: Application[];
}

export interface RoundApplicationsQueryResponse {
  rounds: RoundWithApplications[];
}

export interface ApplicationWithRound {
  id: string;
  chainId: number;
  metadata: ApplicationMetadata;
  metadataCid: string;
  round: {
    id: string;
    roundMetadata: RoundMetadata;
  };
}

export interface ApplicationRoundQueryResponse {
  application: ApplicationWithRound;
}

export interface ManagerRolesResponse {
  rounds: Array<{
    roles: Array<{
      address: string;
    }>;
  }>;
}

export interface RoundDistributionsQueryResponse {
  rounds: Array<{
    totalDistributed: string;
    applications: Array<{
      id: string;
      distributionTransaction: string;
    }>;
  }>;
}
