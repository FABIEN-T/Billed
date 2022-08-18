/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store"; // Ajout
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {  
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async ()=> {
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
    })
    test("Then there should be a form to edit new Bill", () => {      
      document.body.innerHTML = NewBillUI()
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    })    
  }) 
})



//test d'intégration POST

