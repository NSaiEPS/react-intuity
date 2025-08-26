// import React, { useState, useEffect } from "react";

// export default function SaveBankAccount({
//   actualLink = "https://yourdomain.com/",
//   secCode = "web,ppd", // pass from props
//   companyName = "Your Company",
// }) {
//   const [routingNumber, setRoutingNumber] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [accountType, setAccountType] = useState("");
//   const [authorized, setAuthorized] = useState(false);

//   const sec_code = secCode.split(",");

//   // mimic body onload="onLoad()"
//   useEffect(() => {
//     console.log("onLoad() called");
//     // if you had custom script logic inside onLoad in PHP,
//     // move it here
//   }, []);

//   const validateKey = (event) => {
//     if (!/[0-9]/.test(event.key)) {
//       event.preventDefault();
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     let invalidErr = "";

//     if (routingNumber.length < 9) {
//       alert("Please correct the errors with your payment method");
//       return false;
//     }

//     if (!authorized) {
//       alert("You must authorize the company");
//       return false;
//     }

//     // mimic form POST
//     console.log({
//       actualLink,
//       routingNumber,
//       accountNumber,
//       accountType,
//       authorized,
//     });
//     alert("Form submitted successfully!");
//     return true;
//   };

//   const handleReset = () => {
//     setRoutingNumber("");
//     setAccountNumber("");
//     setAccountType("");
//     setAuthorized(false);
//   };

//   return (
//     <div>
//       {/* head equivalent - include CSS/JS links in public/index.html */}
//       <link rel="stylesheet" href="/resources/front/css/nacha/ICG_Style.css" />
//       <link
//         rel="stylesheet"
//         href="/resources/front/css/nacha/bootstrap.min.css"
//       />
//       <link
//         rel="stylesheet"
//         href="/resources/front/css/nacha/bootstrapValidator.min.css"
//       />
//       <link rel="stylesheet" href="/resources/front/css/nacha/all.min.css" />
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
//       />

//       <script src="/resources/front/js/nacha/jquery-3.3.1.min.js"></script>
//       <script src="/resources/front/js/nacha/bootstrap.min.js"></script>
//       <script src="/resources/front/js/nacha/bootstrapValidator.min.js"></script>
//       <script src="/resources/front/js/nacha/iFrameBA.min.js"></script>
//       <script src="/resources/front/js/nacha/constants.js"></script>

//       {/* inline styles */}
//       <style>{`
//         payment { background: white; }
//         input[type='button'], input[type='reset'] {
//           background-color: rgb(51, 201, 199);
//           border: none;
//         }
//       `}</style>

//       {/* hidden aspNet-like inputs */}
//       <div className="aspNetHidden">
//         <input
//           type="hidden"
//           name="__VIEWSTATEGENERATOR"
//           id="__VIEWSTATEGENERATOR"
//           value="39DFECBC"
//         />
//         <input
//           type="hidden"
//           name="__EVENTVALIDATION"
//           id="__EVENTVALIDATION"
//           value="vD9khHkOF1IdCiY5rj0ocW1SPbndKSZSAA9l6c1ZbNafs+9/Ne6Cv7yk7zH9W/kIsDDFe5sMeNnGqnMEAPSSd/ou9LzFaGCd/gh+LvcmsMW0P3BLESQS9VHLRzjCEhs4bSaSAro1vgp+BCyjLgCSrKQdT2s0hwHAwU1T2Dvci4jSlQTQererererererer"
//         />
//       </div>

//       <form id="bankAccountForm" onSubmit={handleSubmit}>
//         <div className="aspNetHidden">
//           <input
//             type="hidden"
//             name="__EVENTTARGET"
//             id="__EVENTTARGET"
//             value=""
//           />
//           <input
//             type="hidden"
//             name="__EVENTARGUMENT"
//             id="__EVENTARGUMENT"
//             value=""
//           />
//           <input
//             type="hidden"
//             name="__VIEWSTATE"
//             id="__VIEWSTATE"
//             value="SZQLAj3OcCeXP2NNRug+xSembx0E89Mz4MwBk0i1wzsFhx8vl2IrM3LVUxXxBO9iieCJo5tXM1BUM9KTBVdtCJLtnqRZERc0sh+LsK4xPW0VEyCni59PH68HMYFTSHXDnxyAsi/lBNJolqNk2PkiBZiUg/H+29G6rU0wcrX4vCpGQBoh94YUdVh8ZFhvjUs3ZPT4kzROrJEQ9c20iBd6R/lR9Zd73/2laYLbJNiRaxbGF0QFebsl0zusW8+l13X3MY/qVdxWM7IsT+UKn1Xgy7sSA+LwAYGs3KNsxFIXxwLckHkamPWfb1tU5H2Nz62b2VsmtmmzPSbjSTHvKsun4Q2ErMQ="
//           />
//         </div>

//         <payment>
//           <input type="hidden" id="hdfOrigin" value={actualLink} />
//           <input type="hidden" id="hdfMaskInput" value="False" />
//           <input type="hidden" id="generateNewToken" value={Date.now()} />

//           <fieldset>
//             <span className="message"></span>

//             {/* Routing Number */}
//             <div className="row">
//               <div className="col-12 col-sm-8 col-md-8 col-lg-8">
//                 <div className="form-group">
//                   <input
//                     name="routingNumber"
//                     type="tel"
//                     id="routingNumber"
//                     autoComplete="off"
//                     placeholder="Routing Number"
//                     maxLength="9"
//                     value={routingNumber}
//                     onChange={(e) => setRoutingNumber(e.target.value)}
//                     onKeyPress={validateKey}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Account Number */}
//             <div className="row">
//               <div className="col-12 col-sm-8 col-md-8 col-lg-8">
//                 <div className="form-group">
//                   <input
//                     name="accountNumber"
//                     type="tel"
//                     id="accountNumber"
//                     autoComplete="off"
//                     placeholder="Account Number"
//                     maxLength="17"
//                     value={accountNumber}
//                     onChange={(e) => setAccountNumber(e.target.value)}
//                     onKeyPress={validateKey}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Account Type */}
//             <div className="row">
//               <div className="col-12 col-sm-8 col-md-8 col-lg-8">
//                 <div className="form-group">
//                   <label htmlFor="accountType">Account Type</label>
//                   <select
//                     name="accountType"
//                     id="accountType"
//                     value={accountType}
//                     onChange={(e) => setAccountType(e.target.value)}
//                   >
//                     <option value="">Select</option>
//                     {(sec_code.includes("web") || sec_code.includes("ppd")) && (
//                       <>
//                         <option value="PC">Personal Checkings</option>
//                         <option value="PS">Personal Savings</option>
//                       </>
//                     )}
//                     {sec_code.includes("ccd") && (
//                       <>
//                         <option value="BC">Business Checking</option>
//                         <option value="BS">Business Savings</option>
//                       </>
//                     )}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Authorization */}
//             <div className="row">
//               <div className="col-lg-12">
//                 <div className="form-group">
//                   <input
//                     type="checkbox"
//                     id="cbxAuthorization"
//                     checked={authorized}
//                     onChange={(e) => setAuthorized(e.target.checked)}
//                   />
//                   <label htmlFor="cbxAuthorization">
//                     I authorize {companyName} to store and enroll the bank
//                     account indicated in this form for payment of one-time
//                     and/or auto recurring transactions for amounts due on my
//                     utility account on or before the due date. I understand that
//                     the authorization will remain in effect until I cancel it
//                     and that payments may be withdrawn from my account on the
//                     same or next banking business day after it is originated.
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="row">
//               <div className="col-lg-12" id="btnSaveBankAccountContainer">
//                 <input
//                   type="submit"
//                   id="btnSaveBankAccount"
//                   className="submit"
//                   value="CONTINUE"
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-lg-12" id="btnClearBankAccountContainer">
//                 <input
//                   id="btnClearBankAccount"
//                   className="submit"
//                   type="reset"
//                   value="RESET"
//                   onClick={handleReset}
//                 />
//               </div>
//             </div>
//           </fieldset>
//         </payment>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Button } from "nsaicomponents";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { colors } from "@/utils";

export default function NachaIframe({ onSuccess }) {
  const [formData, setFormData] = useState({
    routingNumber: "",
    accountNumber: "",
    accountType: "",
    agree: false,
  });

  const [errors, setErrors] = useState<any>({});

  const generateToken = () => {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      agree: e.target.checked,
    }));
  };

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    const numberRegex = /^[0-9]+$/;

    if (!formData.routingNumber) {
      newErrors.routingNumber = "Routing number is required";
    } else if (!numberRegex.test(formData.routingNumber)) {
      newErrors.routingNumber = "Routing number must be numbers only";
    } else if (formData.routingNumber.length < 8) {
      newErrors.routingNumber = "Routing number must be at least 8 digits";
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!numberRegex.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be numbers only";
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = "Account number must be at least 9 digits";
    }

    if (!formData.agree) {
      newErrors.agree = "You must authorize to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (validate()) {
      const data = {
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        accountType: formData.accountType,
        token: generateToken(),
      };
      onSuccess(data);
      console.log("✅ Data:", data);
      // alert("Form submitted! Check console for data.");
    }
  };

  const handleReset = () => {
    setFormData({
      routingNumber: "",
      accountNumber: "",
      accountType: "",
      agree: false,
    });
    setErrors({});
  };

  return (
    <Box
      sx={{
        border: "1px solid #cfd8dc",
        borderRadius: 1,
        p: 3,
        maxWidth: 500,
        mx: "auto",
      }}
    >
      <Typography
        variant="body1"
        align="center"
        sx={{ color: "red", fontWeight: "bold", mb: 1 }}
      >
        ⚠️ WARNING! Only click this button ONCE!
      </Typography>
      <TextField
        fullWidth
        label="Routing Number"
        variant="standard"
        name="routingNumber"
        value={formData.routingNumber}
        onChange={handleChange}
        error={!!errors.routingNumber}
        helperText={errors.routingNumber}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Account Number"
        variant="standard"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        error={!!errors.accountNumber}
        helperText={errors.accountNumber}
        sx={{ mb: 3 }}
      />

      <FormControl
        fullWidth
        variant="standard"
        sx={{ mb: 3 }}
        error={!!errors.accountType}
      >
        <InputLabel>Account Type</InputLabel>
        <Select
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
        >
          <MenuItem value="PC">Personal Checking</MenuItem>
          <MenuItem value="PS">Personal Savings</MenuItem>
          <MenuItem value="BC">Business Checking</MenuItem>
          <MenuItem value="BS">Business Savings</MenuItem>
          <MenuItem value="GL">General Ledger</MenuItem>
        </Select>
        {errors.accountType && (
          <Typography variant="caption" color="error">
            {errors.accountType}
          </Typography>
        )}
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox checked={formData.agree} onChange={handleCheckbox} />
        }
        label={
          <Typography variant="body2">
            SANDBOX - I authorize Creative Technologies - Eldorado to store and
            enroll the bank account indicated in this form for payment of
            one-time and/or auto recurring transactions for amounts due on my
            utility account on or before the due date. I understand that the
            authorization will remain in effect until I cancel it and that
            payments may be withdrawn from my account on the same or next
            banking business day after it is originated.
          </Typography>
        }
      />
      {errors.agree && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mb: 2 }}
        >
          {errors.agree}
        </Typography>
      )}

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{ borderRadius: "12px", height: "41px" }}
        >
          CONTINUE
        </Button>
        <Button
          onClick={handleReset}
          // disabled={loading}
          // loading={loading}

          variant="outlined"
          textTransform="none"
          // disabled={loading}
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            borderRadius: "12px",

            height: "41px",
          }}
        >
          RESET
        </Button>
      </Box>
    </Box>
  );
}
