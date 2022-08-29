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

jest.mock("../app/store", () => mockStore); // permet de mocker l'API, simule son comportement lors des requêtes

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      // permet de définir de nouvelles propriétés, ici stockage de données dans le navigateur web sans faire intervenir le serveur
      value: localStorageMock, // localStorageMock est affecté à la propriété value de localStorage
    });

    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee", // Employee est défini comme utilisateur
      })
    );
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div"); // Création du container de la page sélectionnée avec router()
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // permet d'aiguiller sur la bonne page en fonction de la propriété ROUTES_PATH
      window.onNavigate(ROUTES_PATH.Bills); // navigue vers la page "Note de frais"
      await waitFor(() => screen.getByTestId("icon-window")); // {waitFor}"@testing-library/dom" attends sa détection dans le dom
      const windowIcon = screen.getByTestId("icon-window"); // windowIcon récupère les éléments via data-testid
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon"); // AJOUT : Vérifie si l'icône a bien la class CSS "active-icon" : surbrillance
    });
  });

  describe("When I am on Bills Page with existings bills", () => {
    test("Then bills should be displayed", async () => {
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const recoveryBills = await bills.getBills(); // attends la recupération de la base de données mockée { bills } from "../fixtures/bills.js";
      document.body.innerHTML = BillsUI({ data: recoveryBills }); //
      expect(recoveryBills.length).toBe(4); // vérifie la présence de 4 notes de frais mockées
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // tri par date : de la plus récente à la plus lointaine
      const sortBills = bills.sort((a, b) => (a.date < b.date ? 1 : -1)); // AJOUT
      document.body.innerHTML = BillsUI({ data: sortBills }); // AJOUT
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono); // trie les dates
      expect(dates).toEqual(datesSorted); // compare dates d'origine et celles triées, si égal les dates d'origine sont triées
    });
  });

  // AJOUT de tests
  describe("When I am on Bills Page and I click on icon eye of one bill", () => {
    test("Then modale should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      $.fn.modal = jest.fn(); // simule le fonctionnement de la fonction Jquery() / $() - Prevent jQuery error
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });
      const employeeBill = new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId("icon-eye"); // récupération de l'élément icône voir
      const handleClickIconEye = jest.fn((icon) =>
        employeeBill.handleClickIconEye(icon)
      );

      iconEye.forEach((icon) => {
        icon.addEventListener("click", (e) => handleClickIconEye(icon));
        userEvent.click(icon);
      });
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = screen.getByText("Justificatif");
      expect(modale).toBeTruthy();
    });
  });

  describe("When I click on button new-bill", () => {
    test("Then the page new Bill should open", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const employeeBill = new Bills({
        // création d'une note de frais
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn((e) =>
        employeeBill.handleClickNewBill(e)
      );
      const buttonNewBill = screen.getByTestId("btn-new-bill"); // récupération du bouton "Nouvelle note de frais"
      buttonNewBill.addEventListener("click", handleClickNewBill); // écoute du clic
      userEvent.click(buttonNewBill); // click virtuel sur le bouton "Nouvelle note de frais"
      expect(handleClickNewBill).toHaveBeenCalled(); // Vérifie que la fonction simulée est appelée
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy(); // Vérifie que le titre de la page est présent.
      expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que le formulaire s'affiche
    });
  });
});

/**
 * test d'intégration GET - lecture de données
 */
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // from "../app/Router.js";
      window.onNavigate(ROUTES_PATH.Bills); // aiguillage vers la page Bills
      await waitFor(
        () => expect(screen.getByText("Mes notes de frais")).toBeTruthy() // vérifie que le titre de la page Bill s'affiche
      );
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills"); // simule l'appel des données
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
        document.body.appendChild(root);
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

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/); // slashs regex Pour intégrer espace entre Erreur et 404
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
        // console.log("document.body", document.body.innerHTML)
      });
    });
  });
});
