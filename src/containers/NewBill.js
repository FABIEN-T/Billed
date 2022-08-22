import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    // console.log("file.name", file.name.split(/\\/g))
    // console.log("filePath", filePath)
    const fileName = filePath[filePath.length - 1];
    // console.log("1 fileName", fileName);    
    //[Bug Hunt] - Bills BUG 3 saisie impossible d'un document qui a une extension différente de jpg, jpeg ou png
    let extension = fileName.substring(fileName.lastIndexOf(".") + 1);
    if (extension === "jpg" || extension === "jpeg" || extension === "png") {  
      // console.log(extension);      
      const formData = new FormData(); // FormData() ??
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file); 
      formData.append("email", email);

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          // console.log(fileUrl);
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => console.error(error));
    } else {
      e.target.value = ""; // Correction BUG vider le champ si mauvaise extension
      console.log("2 fileName", fileName);  
      console.log("e.target.value", e.target.value);
      alert(
        "veuillez joindre un fichier avec une extension correcte : jpg, jpeg, png"
      );
      return ""
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    // const fileName = file.name;
    // console.log("SUBMIT fileName", fileName);
      // console.log(
      //   'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      //   e.target.querySelector(`input[data-testid="datepicker"]`).value
      // );
      const email = JSON.parse(localStorage.getItem("user")).email;
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`)
          .value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(
          e.target.querySelector(`input[data-testid="amount"]`).value
        ),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct:
          parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
          20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
          .value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: "pending",
      };
      this.updateBill(bill);
      this.onNavigate(ROUTES_PATH["Bills"]);
    
  };

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
