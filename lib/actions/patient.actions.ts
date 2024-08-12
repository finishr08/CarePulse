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
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    return parseStringify(newuser);
  } catch (error) {
    const err = error as any; // Type assertion
    if (err?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      return existingUser.users[0];
    }
    console.error(
      "An error occurred while creating a new user:",
      err.message || err
    );
    throw new Error("Error creating user");
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
    console.error("An error occurred while creating a new patient:", err.message || err);
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
