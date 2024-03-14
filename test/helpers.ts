import {gql} from 'graphql-tag';

export const UpdateProductNameMutation=gql`
    mutation UpdateProductNameMutation($id: ID!,$newName: String){
        updateProduct(input: {id: $id,translations:{languageCode: en, name: $newName}}){
            name
            id
        }
    }
`
export const GetProductWithId=gql`
    query GetProductWithId($id: ID!){
        product(id: $id){
            name
        }
    }
`

export const GetCollectionWithId=gql`
    query GetCollectionWithId($id: ID!){
        collection(id: $id){
            name
        }
    }
`

export const UpdateCollectionNameMutation=gql`
    mutation UpdateCollectionNameMutation($id: ID!,$newName: String){
        updateCollection(input: {id: $id,translations:{languageCode: en, name: $newName}}){
            name
            id
        }
    }
`