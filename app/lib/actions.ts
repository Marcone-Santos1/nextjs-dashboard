'use server';

import { z } from 'zod';
import {storeInvoice, updateInvoice} from "@/app/lib/data";
import {InvoiceStore, InvoiceUpdate} from "@/app/lib/definitions";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    const invoiceInput: InvoiceStore = {
        customerId,
        status,
        amountInCents,
        date
    };

    await storeInvoice(invoiceInput);

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function editInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    const invoiceInput: InvoiceUpdate = {
        id,
        customerId,
        status,
        amountInCents,
    };

    await updateInvoice(invoiceInput);

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}