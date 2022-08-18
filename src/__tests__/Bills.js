/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js"; // Ajout
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"; // Ajout
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
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
      // console.log("windowIcon", windowIcon);
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon"); // AJOUT : Vérifie si l'icône a bien la class CSS "active-icon"
    });
  });

  describe("When I am on Bills Page with existings bills", () => {
    test("Then bills should be ordered from earliest to latest", () => {
      // code tri par date
      // const sortBills = bills.sort((a, b) => (a.date < b.date ? 1 : -1)); // AJOUT
      // document.body.innerHTML = BillsUI({ data: sortBills }); // AJOUT
            
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });

    // AJOUT

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

        const handleClickNewBill = jest.fn((e) =>
          employeeBill.handleClickNewBill(e)
        );
        const buttonNewBill = screen.getByTestId("btn-new-bill");
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
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
      // console.log("employeeBill", employeeBill);

      const iconEye = screen.getAllByTestId("icon-eye");
      const handleClickIconEye = jest.fn((icon) =>
        employeeBill.handleClickIconEye(icon)
      );

      iconEye.forEach((icon) => {
        icon.addEventListener("click", (e) => handleClickIconEye(icon));
        userEvent.click(icon);
      });
      expect(handleClickIconEye).toHaveBeenCalled();

      // const modale = screen.getByTestId('modaleFile')
      const modale = screen.getByText("Justificatif");
      expect(modale).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // from "../app/Router.js";
      window.onNavigate(ROUTES_PATH.Bills); // Aiguillage vers la page Bills
      await waitFor(
        () => expect(screen.getByText("Mes notes de frais")).toBeTruthy() // On vérifie que le titre de la page Bill s'affiche
      );
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills"); // simule de l'appel des données
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
        document.body.appendChild(root); // création d'un container ?
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          // mockStore.bills : données mockées de store.js
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
        // window.onNavigate(ROUTES_PATH.Bills);
        // await new Promise(process.nextTick);
        // const message = await screen.getByText(/Erreur 404/); // slashs Pour intégrer espace entre Erreur et 404 ?
        // // const message = await screen.getByText("Erreur");
        // expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
        // window.onNavigate(ROUTES_PATH.Bills);
        // await new Promise(process.nextTick);
        // const message = await screen.getByText("Erreur");
        // expect(message).toBeTruthy();
      });
    });
  });
});
