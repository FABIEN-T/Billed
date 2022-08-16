import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  getBills = () => { // récupère la bade de données
      if (this.store) {
      return this.store
      .bills() // back
      .list() // ????
      .then(snapshot => { // réponse à la promesse
        const bills = snapshot
          //.sort((a, b) => (b - a)) 
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Tri des dates
          .map(doc => { // enregistrement
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                // date: doc.date,
                status: formatStatus(doc.status)                
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
          // bills.forEach (tab => { console.log("hey", tab['date']) })
          // console.log("bills", bills);
        return bills
      })
    }
  }
}
