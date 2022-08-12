/**
 * @jest-environment jsdom
 */

// import {screen, waitFor} from "@testing-library/dom"
import {fireEvent, screen, waitFor, getByTestId} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills, { } from "../containers/Bills.js" // Ajout
import { bills } from "../fixtures/bills.js"
// import { ROUTES_PATH} from "../constants/routes.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store" // Ajout
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon") // Vérifie si l'icône a bien la class CSS "active-icon"
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // code tri par date
      const sortBills = bills.sort((a, b) => (a.date < b.date) ? 1 : -1)      
      // document.body.innerHTML = BillsUI({ data: bills })
      document.body.innerHTML = BillsUI({ data: sortBills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })    
  })

  // Ligne 20
  // describe("When I am on Bills Page and I click on icon-eye", () => {
  //   test("Then modaleFile should open", () => {
  //    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //       type: 'Employee'
  //     }))
  //     document.body.innerHTML = BillsUI(bills[0])
  //     const onNavigate = (pathname) => {
  //       document.body.innerHTML = ROUTES({ pathname })
  //     }
  //     const store = null
  //     const employeeBoard = new Bills({
  //       document, onNavigate, store, localStorage: window.localStorage
  //     })

  //     const handleClickIconEye = jest.fn(employeeBoard.handleClickIconEye)
  //     const iconEye = screen.getAllByTestId('icon-eye')
  //     iconEye.forEach( icon => {
  //       icon.addEventListener('click', handleClickIconEye)        
  //     })  
  //     userEvent.click(iconEye)
  //     expect(handleClickIconEye).toHaveBeenCalled()
  //     const modale = screen.getByTestId('modaleFile')
  //     expect(modale).toBeTruthy() 
  //   })
  // })

  
})

// const sortBills = 
// bills.getBills().then(data => { BillsUI({ data }) })