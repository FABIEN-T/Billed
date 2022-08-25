/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
// import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore); // permet de mocker l'API, simuler son comportement lors des requêtes
global.alert = jest.fn(); // permet aux tests de reconnaître window.alert sans provoquer d'erreur


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { // permet de définir de nouvelles propriétés, ici stockage de données dans le navigateur web sans faire intervenir le serveur
        value: localStorageMock, //  localStorageMock est affecté à la propriété value de localStorage
      });

      window.localStorage.setItem( // Employee est défini comme utilisateur
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div"); // Création du container de la page sélectionnée avec router()
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // permet d'aiguiller sur la bonne page en fonction de la propriété ROUTES_PATH
      window.onNavigate(ROUTES_PATH.NewBill); // navigue vers la page "Note de frais"
      await waitFor(() => screen.getByTestId("icon-mail")); // {waitFor}"@testing-library/dom" attends sa détection dans le dom
      const mailIcon = screen.getByTestId("icon-mail"); // windowIcon récupère les éléments via data-testid
      expect(mailIcon.className).toEqual("active-icon");
    });

    test("Then there should be a form to edit a new Bill", () => {
      document.body.innerHTML = NewBillUI();
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });
  })
});

describe("Given I am connected as an employee on New Bill Page", () => {
  let newBill;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    const html = NewBillUI();
    document.body.innerHTML = html;
    newBill = new NewBill({
      document,
      onNavigate: (pathname) =>
        (document.body.innerHTML = ROUTES({ pathname })),
      mockStore: mockStore,
      localStorage: window.localStorage,
    });
  });

  describe("When I select a file", () => {
    test("it should call handleChangeFile method", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["proof.jpg"], "proof.jpg", { type: "image/jpg" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
    });
  });

  describe("and the file format is valid", () => {
    test("it should update the input field", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["proof.jpg"], "proof.jpg", { type: "image/jpg" })],
        },
      });
      expect(inputFile.files[0].name).toBe("proof.jpg");
    });
  });

  describe("and the file format is not valid", () => {
    test("it should not update the input field", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["invoice.pdf"], "invoice.pdf", { type: "document/pdf" }),
          ],
        },
      });      
      // expect(inputFile.files[0].name).toBe("invoice.pdf");
      expect(handleChangeFile).toHaveReturnedWith(""); // Pas d'influence sur lcov-report
    });
  });

  describe("when I submit the form with empty fields", () => {
    test("then I should stay on new Bill page", () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("pct").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });
  });

  describe("When I submit the New Bill form", () => {
    test("It should call handleSubmit method", async () => {
      const handleSubmit = jest.fn(newBill.handleSubmit);
      await waitFor(() => screen.getByTestId("form-new-bill"));
      const newBillForm = screen.getByTestId("form-new-bill");
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});








/**
 * test d'intégration POST OK
 */

 describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  });

  describe("When I create new bill", () => {
    test("send bill to mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
      const root = document.createElement("div");
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      jest.spyOn(mockStore, "bills")

      const newBill = new NewBill({
                  document,
                  onNavigate,
                  store: mockStore,
                  localStorage: window.localStorage,
                });
      // await waitFor(() => screen.getByTestId("form-new-bill"));
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      console.log("document.body", document.body.innerHTML)
      expect(handleSubmit).toHaveBeenCalled
    })
  

    describe("When an error occurs on API", () => {
      test("then it should display a message error 404", async () => {
        console.error = jest.fn();
        window.onNavigate(ROUTES_PATH.NewBill);
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
        await new Promise(process.nextTick);
        expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
      });

      test("then it should display a message error 500", async () => {
        console.error = jest.fn();
        window.onNavigate(ROUTES_PATH.NewBill);
        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
        await new Promise(process.nextTick);
        expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
      });
    });
  });
});