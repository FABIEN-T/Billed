/**
 * @jest-environment jsdom
 */

// import {screen, waitFor} from "@testing-library/dom"
import { fireEvent, screen, waitFor, getByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js"; // Ajout
import { bills } from "../fixtures/bills.js";
// import { ROUTES_PATH} from "../constants/routes.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"; // Ajout
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  // AJOUT
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon"); // AJOUT : Vérifie si l'icône a bien la class CSS "active-icon"
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // code tri par date
      const sortBills = bills.sort((a, b) => (a.date < b.date ? 1 : -1)); // AJOUT
      document.body.innerHTML = BillsUI({ data: sortBills }); // AJOUT
      // document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // Ligne 20
  describe("When I am on Bills Page and I click on icon eye of one bill", () => {
    test("Then modale should open", () => {
      // Object.defineProperty(window, "localStorage", {
      //   value: localStorageMock,
      // });
      // window.localStorage.setItem(
      //   "user",
      //   JSON.stringify({
      //     type: "Employee",
      //   })
      // );
      $.fn.modal = jest.fn(); // simule le fonctionnement de la fonction Jquery() / $() - Prevent jQuery error   
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // document.body.innerHTML = BillsUI(bills[0]);      
      document.body.innerHTML = BillsUI({ data: bills });
      // const store = null;
      const employeeBill = new Bills({
        document,
        onNavigate,
        // store,
        mockStore, //ajout mockstore
        localStorage: window.localStorage,
      });
      console.log("employeeBill", employeeBill);

      const iconEye = screen.getAllByTestId("icon-eye");      
      const handleClickIconEye = jest.fn(icon => employeeBill.handleClickIconEye(icon));
      
      iconEye.forEach(icon => {
        icon.addEventListener('click', (e) => handleClickIconEye(icon));
        userEvent.click(icon);
      })
      expect(handleClickIconEye).toHaveBeenCalled()

      // const modale = screen.getByTestId('modaleFile')
      const modale = screen.getByText('Justificatif')
      expect(modale).toBeTruthy()
    })
  });

});

describe("When I click on button new-bill", () => {
  test("Then the modal new Bill should open", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const employeeBill = new Bills({
      document,
      onNavigate,
      mockStore,
      localStorage: window.localStorage,
    });

    const handleClickNewBill = jest.fn((e) => employeeBill.handleClickNewBill(e));
    const buttonNewBill = screen.getByTestId("btn-new-bill");
    buttonNewBill.addEventListener("click", handleClickNewBill);
    userEvent.click(buttonNewBill);
    expect(handleClickNewBill).toHaveBeenCalled();
    expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});