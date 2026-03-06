import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class home extends NavigationMixin(LightningElement) {

 navigateToAppointment() {
    this[NavigationMixin.Navigate]({
        type: 'standard__component',
        attributes: {
            componentName: 'c__test'
        }
    });
  }
}