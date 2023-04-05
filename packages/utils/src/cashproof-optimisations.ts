export default `
# This file can be run with CashProof to prove that the optimisations preserve exact functionality
# This includes most of CashScript's bytecode optimisations, although some are incompatible with CashProof

# Hardcoded arithmetic
# OP_NOT OP_IF                         <=> OP_NOTIF;
OP_1 OP_ADD                            <=> OP_1ADD;
OP_1 OP_SUB                            <=> OP_1SUB;
OP_1 OP_NEGATE                         <=> OP_1NEGATE;
OP_0 OP_NUMEQUAL OP_NOT                <=> OP_0NOTEQUAL;
OP_NUMEQUAL OP_NOT                     <=> OP_NUMNOTEQUAL;
OP_SHA256 OP_SHA256                    <=> OP_HASH256;
OP_SHA256 OP_RIPEMD160                 <=> OP_HASH160;

# Hardcoded stack ops
OP_2 OP_PICK OP_1 OP_PICK OP_3 OP_PICK <=> OP_3DUP OP_SWAP;
OP_2 OP_PICK OP_2 OP_PICK OP_2 OP_PICK <=> OP_3DUP;

OP_0 OP_PICK OP_2 OP_PICK              <=> OP_2DUP OP_SWAP;
OP_2 OP_PICK OP_4 OP_PICK              <=> OP_2OVER OP_SWAP;
OP_3 OP_PICK OP_3 OP_PICK              <=> OP_2OVER;

OP_2 OP_ROLL OP_3 OP_ROLL              <=> OP_2SWAP OP_SWAP;
OP_3 OP_ROLL OP_3 OP_ROLL              <=> OP_2SWAP;
OP_4 OP_ROLL OP_5 OP_ROLL              <=> OP_2ROT OP_SWAP;
OP_5 OP_ROLL OP_5 OP_ROLL              <=> OP_2ROT;

OP_0 OP_PICK                           <=> OP_DUP;
OP_1 OP_PICK                           <=> OP_OVER;
OP_0 OP_ROLL                           <=> ;
OP_1 OP_ROLL                           <=> OP_SWAP;
OP_2 OP_ROLL                           <=> OP_ROT;
OP_DROP OP_DROP                        <=> OP_2DROP;

# Secondary effects
OP_DUP OP_SWAP                         <=> OP_DUP;
OP_SWAP OP_SWAP                        <=> ;
OP_2SWAP OP_2SWAP                      <=> ;
OP_ROT OP_ROT OP_ROT                   <=> ;
OP_2ROT OP_2ROT OP_2ROT                <=> ;
OP_OVER OP_OVER                        <=> OP_2DUP;
OP_DUP OP_DROP                         <=> ;
OP_DUP OP_NIP                          <=> ;

# Enabling secondary effects
OP_DUP OP_OVER                         <=> OP_DUP OP_DUP;

# Merge OP_VERIFY
OP_EQUAL OP_VERIFY                     <=> OP_EQUALVERIFY;
OP_NUMEQUAL OP_VERIFY                  <=> OP_NUMEQUALVERIFY;
OP_CHECKSIG OP_VERIFY                  <=> OP_CHECKSIGVERIFY;
# OP_CHECKMULTISIG OP_VERIFY           <=> OP_CHECKMULTISIGVERIFY;
OP_CHECKDATASIG OP_VERIFY              <=> OP_CHECKDATASIGVERIFY;

# Remove/replace extraneous OP_SWAP
# OP_SWAP OP_AND                         <=> OP_AND;
# OP_SWAP OP_OR                          <=> OP_OR;
# OP_SWAP OP_XOR                         <=> OP_XOR;
OP_SWAP OP_ADD                         <=> OP_ADD;
OP_SWAP OP_EQUAL                       <=> OP_EQUAL;
OP_SWAP OP_NUMEQUAL                    <=> OP_NUMEQUAL;
OP_SWAP OP_NUMNOTEQUAL                 <=> OP_NUMNOTEQUAL;
OP_SWAP OP_GREATERTHANOREQUAL          <=> OP_LESSTHANOREQUAL;
OP_SWAP OP_LESSTHANOREQUAL             <=> OP_GREATERTHANOREQUAL;
OP_SWAP OP_GREATERTHAN                 <=> OP_LESSTHAN;
OP_SWAP OP_LESSTHAN                    <=> OP_GREATERTHAN;
OP_SWAP OP_DROP                        <=> OP_NIP;
OP_SWAP OP_NIP                         <=> OP_DROP;

# Remove/replace extraneous OP_DUP
# OP_DUP OP_AND                         <=> ;
# OP_DUP OP_OR                          <=> ;
OP_DUP OP_DROP                        <=> ;
OP_DUP OP_NIP                         <=> ;

# Random optimisations (don't know what I'm targeting with this)
OP_2DUP OP_DROP                        <=> OP_OVER;
OP_2DUP OP_NIP                         <=> OP_DUP;
OP_CAT OP_DROP                         <=> OP_2DROP;
OP_NIP OP_DROP                         <=> OP_2DROP;

# Far-fetched stuff
OP_DUP OP_ROT OP_SWAP OP_DROP          <=> OP_SWAP;
OP_OVER OP_ROT OP_SWAP OP_DROP         <=> OP_SWAP;
OP_2 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_3 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_4 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_5 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_6 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_7 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_8 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_9 OP_PICK OP_ROT OP_SWAP OP_DROP    <=> OP_SWAP;
OP_10 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_11 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_12 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_13 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_14 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_15 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;
OP_16 OP_PICK OP_ROT OP_SWAP OP_DROP   <=> OP_SWAP;

OP_DUP OP_ROT OP_DROP                  <=> OP_NIP OP_DUP;
OP_OVER OP_ROT OP_DROP                 <=> OP_SWAP;
OP_2 OP_PICK OP_ROT OP_DROP            <=> OP_NIP OP_OVER;

OP_0 OP_NIP                            <=> OP_DROP OP_0;
OP_1 OP_NIP                            <=> OP_DROP OP_1;
OP_2 OP_NIP                            <=> OP_DROP OP_2;
OP_3 OP_NIP                            <=> OP_DROP OP_3;
OP_4 OP_NIP                            <=> OP_DROP OP_4;
OP_5 OP_NIP                            <=> OP_DROP OP_5;
OP_6 OP_NIP                            <=> OP_DROP OP_6;
OP_7 OP_NIP                            <=> OP_DROP OP_7;
OP_8 OP_NIP                            <=> OP_DROP OP_8;
OP_9 OP_NIP                            <=> OP_DROP OP_9;
OP_10 OP_NIP                           <=> OP_DROP OP_10;
OP_11 OP_NIP                           <=> OP_DROP OP_11;
OP_12 OP_NIP                           <=> OP_DROP OP_12;
OP_13 OP_NIP                           <=> OP_DROP OP_13;
OP_14 OP_NIP                           <=> OP_DROP OP_14;
OP_15 OP_NIP                           <=> OP_DROP OP_15;
OP_16 OP_NIP                           <=> OP_DROP OP_16;

OP_2 OP_PICK OP_SWAP OP_2 OP_PICK OP_NIP <=> OP_DROP OP_2DUP;
`;
