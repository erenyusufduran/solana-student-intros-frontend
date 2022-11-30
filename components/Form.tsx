import { FC } from "react";
import { StudentIntro } from "../models/StudentIntro";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as Web3 from "@solana/web3.js";
import { Box, Button, FormControl, FormLabel, Input, Textarea } from "@chakra-ui/react";

const STUDENT_INTRO_PROGRAM_ID = "GaWifTcvFSQnSzbxwB4kbzK2Mixyoviv4dzxXjdhf2zm";

export const Form: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const studentIntro = new StudentIntro(name, message);
    handleTransactionSubmit(studentIntro);
  };

  const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return;
    }
    const buffer = studentIntro.serialize();
    const transaction = new Web3.Transaction();

    const [pda] = await Web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer()],
      new Web3.PublicKey(STUDENT_INTRO_PROGRAM_ID)
    );

    const instruction = new Web3.TransactionInstruction({
      keys: [
        {
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: Web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new Web3.PublicKey(STUDENT_INTRO_PROGRAM_ID),
    });

    transaction.add(instruction);

    try {
      let txId = await sendTransaction(transaction, connection);
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txId}?cluster=devnet`);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  };

  return (
    <Box p={4} display={{ md: "flex" }} maxWidth="32rem" borderWidth={1} margin={2} justifyContent="center">
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">What do we call you?</FormLabel>
          <Input id="name" color="gray.400" onChange={(event) => setName(event.currentTarget.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">What brings you to Solana, friend?</FormLabel>
          <Textarea id="message" color="gray.400" onChange={(event) => setMessage(event.currentTarget.value)} />
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
};
