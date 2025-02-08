best_metric = -1
best_metric_epoch = -1
epoch_loss_values = []
metric_values = []
writer = SummaryWriter()

scheduler = StepLR(optimizer, step_size=10, gamma=0.1)

patience = 5
no_improve = 0

scaler = GradScaler()

def train_one_epoch(model, loader, optimizer, loss_function, device, epoch, writer, scaler, max_grad_norm=1.0):
    model.train()
    epoch_loss = 0
    step = 0
    total_steps = len(loader)

    for batch_data in loader:
        step += 1
        inputs, labels = batch_data[0].to(device), batch_data[1].to(device)
        optimizer.zero_grad()

        with autocast():
            outputs = model(inputs)
            loss = loss_function(outputs, labels)

        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
        scaler.step(optimizer)
        scaler.update()

        epoch_loss += loss.item()
        print(f"Step [{step}/{total_steps}], train_loss: {loss.item():.4f}")
        writer.add_scalar("train_loss", loss.item(), total_steps * epoch + step)

    avg_loss = epoch_loss / step
    return avg_loss

def validate(model, loader, device, auc_metric, y_trans, y_pred_trans):
    model.eval()
    with torch.no_grad():
        y_pred_all = torch.tensor([], dtype=torch.float32, device=device)
        y_true_all = torch.tensor([], dtype=torch.long, device=device)

        for val_data in loader:
            val_images, val_labels = val_data[0].to(device), val_data[1].to(device)
            outputs = model(val_images)
            y_pred_all = torch.cat([y_pred_all, outputs], dim=0)
            y_true_all = torch.cat([y_true_all, val_labels], dim=0)

        y_onehot = [y_trans(i) for i in decollate_batch(y_true_all, detach=False)]
        y_pred_act = [y_pred_trans(i) for i in decollate_batch(y_pred_all)]

        auc_metric(y_pred_act, y_onehot)
        auc_result = auc_metric.aggregate()
        auc_metric.reset()


        acc_metric = torch.eq(y_pred_all.argmax(dim=1), y_true_all).sum().item() / y_true_all.size(0)
    return auc_result, acc_metric


for epoch in range(max_epochs):
    print("-" * 10)
    print(f"Epoch {epoch + 1}/{max_epochs}")


    epoch_loss = train_one_epoch(model, train_loader, optimizer, loss_function, device, epoch, writer, scaler)
    epoch_loss_values.append(epoch_loss)
    print(f"Epoch {epoch + 1} average loss: {epoch_loss:.4f}")

    if (epoch + 1) % val_interval == 0:
        auc_result, acc_metric = validate(model, val_loader, device, auc_metric, y_trans, y_pred_trans)
        metric_values.append(auc_result)
        writer.add_scalar("val_accuracy", acc_metric, epoch + 1)
        print(f"Epoch: {epoch + 1} | Current AUC: {auc_result:.4f} | Current Accuracy: {acc_metric:.4f}")

        if auc_result >= best_metric:
            best_metric = auc_result
            best_metric_epoch = epoch + 1
            torch.save(model.state_dict(), os.path.join(data_dir, "best_metric_model.pth"))
            print("Saved new best metric model")
            no_improve = 0
        else:
            no_improve += 1
            if no_improve >= patience:
                print("No improvement for several epochs, stopping early.")
                break

    scheduler.step()
print(f"Training completed, best_metric: {best_metric:.4f} at epoch: {best_metric_epoch}")
writer.close()
