"use server";

import { ID, InputFile, Query } from "node-appwrite";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

const VALID_GENDERS = ["male", "female", "other"];

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Check if a user with the same email already exists
    const existingUsersByEmail = await users.list([
      Query.equal("email", [user.email]),
    ]);

    if (existingUsersByEmail.users.length > 0) {
      console.log(
        "User already exists with this email:",
        existingUsersByEmail.users[0]
      );
      return parseStringify(existingUsersByEmail.users[0]);
    }

    // Check if a user with the same phone already exists
    const existingUsersByPhone = await users.list([
      Query.equal("phone", [user.phone]),
    ]);

    if (existingUsersByPhone.users.length > 0) {
      console.log(
        "User already exists with this phone number:",
        existingUsersByPhone.users[0]
      );
      return parseStringify(existingUsersByPhone.users[0]);
    }

    // Create new user if no existing user is found
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone, // Ensure you include the password if required
      user.name
    );

    return parseStringify(newUser);
  } catch (error) {
    const err = error as any; // Type assertion
    console.error(
      "An error occurred while creating a new user:",
      err.message || err
    );
    throw new Error(`Error creating user: ${err.message}`);
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    const err = error as any; // Type assertion
    console.error(
      "An error occurred while retrieving the user details:",
      err.message || err
    );
    throw new Error("Error retrieving user");
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  insuranceProvider,
  insurancePolicyNumber,
  gender,
  ...patient
}: RegisterUserParams) => {
  try {
    // Normalize and validate gender value
    const normalizedGender = gender.toLowerCase();
    if (!VALID_GENDERS.includes(normalizedGender)) {
      throw new Error(
        `Invalid gender value: ${gender}. Must be one of ${VALID_GENDERS.join(", ")}`
      );
    }

    let file;
    if (identificationDocument) {
      const blobFile = identificationDocument.get("blobFile") as Blob;
      const fileName = identificationDocument.get("fileName") as string;

      if (blobFile && fileName) {
        const inputFile = InputFile.fromBlob(blobFile, fileName);
        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      }
    }

    // Prepare patient data
    const patientData: Record<string, any> = {
      identificationDocumentId: file?.$id || null,
      identificationDocumentUrl: file?.$id
        ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
        : null,
      gender: normalizedGender, // Use normalized gender
      ...patient,
    };

    // Add optional fields only if defined
    if (insuranceProvider) {
      patientData.insuranceProvider = insuranceProvider;
    }
    if (insurancePolicyNumber) {
      patientData.insurancePolicyNumber = insurancePolicyNumber;
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      patientData
    );

    return parseStringify(newPatient);
  } catch (error) {
    const err = error as any; // Type assertion
    console.error(
      "An error occurred while creating a new patient:",
      err.message || err
    );
    throw new Error("Error registering patient");
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    const err = error as any; // Type assertion
    console.error(
      "An error occurred while retrieving the patient details:",
      err.message || err
    );
    throw new Error("Error retrieving patient details");
  }
};
