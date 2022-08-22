/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, userEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);
global.alert = jest.fn();


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      // console.log("icon-mail", icon-mail);
      expect(mailIcon.className).toEqual("active-icon");
    });

    test("Then there should be a form to edit new Bill", () => {
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
          files: [new File(["proof.jpg"], "proof.jpg", { type: "image/jpg" })], // File ?
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
      // console.log("INPUT", (inputFile.files[0].name))
      // console.log("INPUT2", e.target.value)
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





//test d'intégration POST - données via formualaire

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

  describe("when APi is working well", () => {
  //   test("then i should be sent on bills page with bills updated", async () => {
  //     const newBill = new NewBill({
  //       document,
  //       onNavigate,
  //       store: mockStore,
  //       localStorage: window.localStorageMock,
  //     });

  //     const form = await waitFor(() =>screen.getByTestId("form-new-bill"));
  //     const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
  //     form.addEventListener("submit", handleSubmit);

  //     fireEvent.submit(form);

  //     expect(handleSubmit).toHaveBeenCalled();
  //     expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  //     expect(mockStore.bills).toHaveBeenCalled();
  //   });    
  });
 

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          // email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Dashboard);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      console.log("AAA", document.body.innerHTML)
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Dashboard);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});