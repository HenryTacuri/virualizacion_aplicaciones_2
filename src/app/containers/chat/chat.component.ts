import { Component, OnInit } from '@angular/core';

import * as io from 'socket.io-client';
import { ModalService } from 'src/app/services/modal-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public mensaje!: string;
  public modalSwitch?: boolean;

  userName = '';
  message = '';
  messageList: {message: string, userName: string, mine: boolean}[] = [];
  userList: string[] = [];
  socket: any;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
    this.modalService.modal.subscribe((valor) => {this.modalSwitch = valor});
  }

  userNameUpdate(name: string): void {
    this.socket = io.io(`localhost:3000/?userName=${name}`);

    this.mensaje = 'Te has conectado'
    this.openModal();

    this.userName = name;

    this.socket.emit('set-user-name', name);

    this.socket.on('user-list', (userList: string[]) => {
      this.userList = userList;
    });

    this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
      if (data) {
        this.messageList.push({message: data.message, userName: data.userName, mine: false});
      }
    });
  }

  sendMessage(): void {
    this.socket.emit('message', this.message);
    this.messageList.push({message: this.message, userName: this.userName, mine: true});
    this.message = '';
  }

  onDisconnect(): void {
    this.socket.disconnect();
    this.mensaje = 'Te has desconectado'
    this.openModal();
  }

  onConnect(): void {
    this.socket.connect();
    this.mensaje = 'Te has conectado nuevamente'
    this.openModal();
  }

  openModal() {
    this.modalSwitch = true;
  }

}
