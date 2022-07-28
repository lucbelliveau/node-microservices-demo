import { gql } from '@apollo/client'

interface Bug {
  id: number;
  title: string;
  description: string;
}

export interface Bugs {
  bugs: Bug[];
}

export const GET_BUGS = gql`
  query {
    bugs {
      id
      title
			description
    }
  }
`
