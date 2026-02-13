import InvoiceForm from '../components/Invoice/InvoiceForm';

export default function CreateInvoice() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Create Invoice</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new invoice
        </p>
      </div>
      <InvoiceForm />
    </div>
  );
}
