import React, { useState, useContext } from "react";
import { StyleSheet, View, ScrollView, Image, Alert } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AuthContext from "../contexts/auth";
import jwt_decode from "jwt-decode";

// Components
import Page from "../components/Page";
import Heading from "../components/Heading";
import Paragraph from "../components/Paragraph";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import TextLink from "../components/TextLink";

import { useToast } from "react-native-toast-notifications";

import authApi from "../api/auth";
import useApi from "../hooks/useApi";
import authStorage from "../utilities/authStorage";

const validationSchema = Yup.object({
  firstName: Yup.string().required().label("First name"),
  lastName: Yup.string().label("Last Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
  passwordConfirmation: Yup.string()
    .required("Password needs to be confirmed")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

export default function RegisterScreen({ route, navigation }) {
  const registerApi = useApi(authApi.register);

  const authContext = useContext(AuthContext);

  const toast = useToast();

  const registerHandler = async ({
    firstName,
    lastName,
    email,
    password,
  }) => {
    var readerType;
    var readerGoals;
    var readerGenres;
    try {
      readerType = route.params.readerType;
      readerGoals = route.params.readerGoals;
      readerGenres = route.params.readerGenres;
    } catch (e) {
      readerType = null;
      readerGoals = [];
      readerGenres = [];
    }

    const result = await registerApi.request(
      firstName.trim(),
      lastName.trim(),
      email,
      password,
      readerType,
      readerGoals,
      readerGenres
    );

    if (!result.ok) {
      toast.show(result.data, {type: "danger"});
      return;
    }

    toast.show(result.data.message, {type: "success"});

    setTimeout(() => {
      AsyncStorage.setItem("hasOnboarded", "true");
      var { user } = jwt_decode(result.headers["bearer-token"]);
      authContext.setUser(user);
      authStorage.storeToken(result.headers["bearer-token"]);

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }, 300);
  };

  return (
    <>
      <Page>
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Heading
              style={{
                marginBottom: 30,
                marginTop: 10,
                flex: 1,
              }}
            >
              Registration
            </Heading>
          </View>

          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              passwordConfirmation: "",
            }}
            onSubmit={registerHandler}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              errors,
              setFieldTouched,
              touched,
              values,
            }) => (
              <>
                <ScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <TextInput
                        placeholder="First Name"
                        autoCompleteType="name"
                        keyboardType="default"
                        returnKeyType="next"
                        textContentType="givenName"
                        autoCapitalize="none"
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        errorMessage={errors.firstName}
                        onBlur={() => setFieldTouched("firstName")}
                        errorVisible={touched.firstName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        placeholder="Last Name"
                        autoCompleteType="name"
                        keyboardType="default"
                        returnKeyType="next"
                        textContentType="familyName"
                        autoCapitalize="none"
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        errorMessage={errors.lastName}
                        onBlur={() => setFieldTouched("lastName")}
                        errorVisible={touched.lastName}
                      />
                    </View>
                  </View>
                  <TextInput
                    placeholder="Email"
                    autoCompleteType="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    errorMessage={errors.email}
                    onBlur={() => setFieldTouched("email")}
                    errorVisible={touched.email}
                  />
                  <TextInput
                    placeholder="Password"
                    autoCompleteType="password"
                    keyboardType="default"
                    returnKeyType="next"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    value={values.password}
                    onChangeText={handleChange("password")}
                    errorMessage={errors.password}
                    onBlur={() => setFieldTouched("password")}
                    errorVisible={touched.password}
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    autoCompleteType="password"
                    keyboardType="default"
                    returnKeyType="done"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    value={values.passwordConfirmation}
                    onChangeText={handleChange("passwordConfirmation")}
                    errorMessage={errors.passwordConfirmation}
                    onBlur={() => setFieldTouched("passwordConfirmation")}
                    errorVisible={touched.passwordConfirmation}
                  />
                </ScrollView>

                <Button loading={registerApi.loading} onPress={handleSubmit} style={{ marginTop: 20 }}>
                  Sign up
                </Button>
              </>
            )}
          </Formik>

          <View
            style={{ marginTop: 20, marginBottom: 10, flexDirection: "row" }}
          >
            <Paragraph style={{ marginRight: 10 }}>Have an account?</Paragraph>
            <TextLink onPress={() => navigation.navigate("Login")}>
              Login
            </TextLink>
          </View>
        </KeyboardAwareScrollView>
      </Page>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 70,
    height: 70,
    marginTop: -15,
  },
});
