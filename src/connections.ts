const { CreateNewBox } = require('database/rewards');
const { GetValueByKey } = require('database/balances');
const express = require('express');

const AuthMsg = (): string => {
  const dt = new Date().getTime();
  return 'auth_' + String(dt - (dt % 600000));
};

let adminWallet = '';

GetValueByKey('ADMIN_WALLET').then((value) => {
  adminWallet = value.toLowerCase();
});

/* 
  {
    level: number,
    ownerAddress: string,
    ownerLogin?: string
    signature: string
  }
*/

const CreateBox = async (req, res) => {
  const body = req.body;
  const boxId = await CreateNewBox(body.level, body.ownerAddress, body.ownerLogin);
  res.status(200).send({
    box: boxId
  })
};
