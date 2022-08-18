/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store"; // Ajout

describe("Given I am connected as an employee", () => {  
  describe("When I am on NewBill Page", () => {
    test("Then it should appears a form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    })
  })
  describe("When I am on NewBill Page", () => {
    test("Then it should appears a form", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      
    })
  })
})



//test d'intégration POST

