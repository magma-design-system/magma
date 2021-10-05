import { Component, getAssetPath, Host, h } from '@stencil/core'

@Component({
  tag: 'mds-spinner',
  styleUrl: 'mds-spinner.css',
  shadow: true,
})
export class MdsSpinner {

  render () {
    return (
      <Host>
        <svg class="wifi-wave wifi-wave--large" width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.8495 14.1508C35.6483 5.94964 22.3519 5.94981 14.151 14.1508C13.37 14.9318 12.1036 14.9318 11.3226 14.1508C10.5416 13.3698 10.5416 12.1033 11.3226 11.3223C21.0857 1.55922 36.9148 1.55922 46.6779 11.3223C47.4589 12.1033 47.4589 13.3698 46.6779 14.1508C45.8969 14.9318 44.6305 14.9318 43.8495 14.1508Z" fill="black"/>
        </svg>
        <svg class="wifi-wave wifi-wave--medium" width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M33.021 8.97918C26.3821 2.34027 15.6183 2.34027 8.97934 8.97918C8.19829 9.76023 8.19829 11.0266 8.97934 11.8076C9.76039 12.5887 11.0267 12.5887 11.8078 11.8076C16.8846 6.7308 25.1157 6.7308 30.1925 11.8076C30.9736 12.5887 32.2399 12.5887 33.021 11.8076C33.802 11.0266 33.802 9.76023 33.021 8.97918Z" fill="black"/>
        </svg>
        <svg class="wifi-wave wifi-wave--small" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.364 6.63605C15.8491 3.12123 10.1507 3.1214 6.63604 6.63605C5.85504 7.41704 5.85504 8.68348 6.63604 9.46448C7.41703 10.2455 8.68347 10.2455 9.46447 9.46448C11.4171 7.51182 14.583 7.51199 16.5355 9.46448C17.3165 10.2455 18.583 10.2455 19.364 9.46448C20.145 8.68348 20.145 7.41704 19.364 6.63605Z" fill="black"/>
        </svg>
      </Host>
    )
  }

}
